import { v4 as uuidv4 } from 'uuid';
import {
  ResumeUploadConfig,
  UploadResult,
  BatchUploadResult,
  ProcessingResult,
  ResumeMetadata,
  UploadStatus,
  ResumeFormat,
  FileValidationResult
} from './types';
import { FileValidator } from './fileValidator';
import { TextExtractor } from './textExtractor';
import { EncryptionService } from './encryptionService';
import { SessionManager } from './sessionManager';
import { ExternalServiceClient } from './externalServiceClient';
import { analyticsService } from '../analyticsService';
import { realtimeService } from '../realtimeService';
import { emailService } from '../emailService';

/**
 * ResumeUploadService - Main service for resume upload and processing
 */
export class ResumeUploadService {
  private fileValidator: FileValidator;
  private textExtractor: TextExtractor;
  private encryptionService: EncryptionService;
  private sessionManager: SessionManager;
  private externalServiceClient?: ExternalServiceClient;
  private config: ResumeUploadConfig;

  // In-memory storage for demo (use database in production)
  private resumes: Map<string, ResumeMetadata & { encryptedContent?: Buffer; textContent?: string }> = new Map();
  private processingResults: Map<string, ProcessingResult> = new Map();

  constructor(
    config?: Partial<ResumeUploadConfig>,
    externalServiceConfig?: any
  ) {
    // Default configuration
    this.config = {
      maxFileSize: config?.maxFileSize || 5 * 1024 * 1024, // 5MB
      allowedFormats: config?.allowedFormats || ['pdf', 'doc', 'docx', 'txt'],
      sessionExpirationHours: config?.sessionExpirationHours || 24,
      retentionDays: config?.retentionDays || 30,
      rateLimitPerHour: config?.rateLimitPerHour || 100,
      encryptionEnabled: config?.encryptionEnabled !== false
    };

    // Initialize components
    this.fileValidator = new FileValidator(this.config);
    this.textExtractor = new TextExtractor();
    this.encryptionService = new EncryptionService();
    this.sessionManager = new SessionManager(this.config.sessionExpirationHours);
    
    if (externalServiceConfig) {
      this.externalServiceClient = new ExternalServiceClient(externalServiceConfig);
    }
  }

  /**
   * Upload a single resume
   */
  async uploadResume(
    fileBuffer: Buffer,
    fileName: string,
    userId: string,
    jobDescriptionId?: string
  ): Promise<UploadResult> {
    // Validate file
    const validationResult = this.fileValidator.validate(fileBuffer, fileName);
    
    if (!validationResult.valid) {
      return {
        resumeId: '',
        sessionId: '',
        success: false,
        error: validationResult.error
      };
    }

    // Create session
    const session = this.sessionManager.createSession(userId, jobDescriptionId);

    try {
      // Extract text
      const extractionResult = await this.textExtractor.extractText(
        fileBuffer,
        validationResult.format!
      );

      // Encrypt content if enabled
      let encryptedContent: Buffer | undefined;
      if (this.config.encryptionEnabled) {
        const { encrypted } = this.encryptionService.encrypt(fileBuffer);
        encryptedContent = encrypted;
      }

      // Create resume metadata
      const resumeId = uuidv4();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.config.retentionDays * 24 * 60 * 60 * 1000);

      const resume: ResumeMetadata & { encryptedContent?: Buffer; textContent?: string } = {
        id: resumeId,
        fileName,
        fileSize: fileBuffer.length,
        format: validationResult.format!,
        mimeType: validationResult.mimeType!,
        uploadedAt: now,
        expiresAt,
        userId,
        status: 'pending',
        jobDescriptionIds: jobDescriptionId ? [jobDescriptionId] : [],
        encryptedContent,
        textContent: extractionResult.text
      };

      // Store resume
      this.resumes.set(resumeId, resume);

      // Add to session
      this.sessionManager.addResumeToSession(session.id, resumeId);

      // High-impact push 2: Analytics & Realtime
      analyticsService.trackCandidateUpload(userId, resumeId, 'direct_upload');
      realtimeService.logActivity(resume.organization?.toString() || 'default', 'Resume Uploaded', `New resume detected: ${fileName}`);

      // Start async processing
      this.processResume(resumeId, extractionResult.text, jobDescriptionId);

      return {
        resumeId,
        sessionId: session.id,
        success: true
      };
    } catch (error: any) {
      // Enhanced error handling with specific error codes and user-friendly messages
      let errorCode = 'UPLOAD_FAILED';
      let errorMessage = error.message;
      
      // Categorize PDF processing errors
      if (error.message.includes('PDF')) {
        if (error.message.includes('timeout')) {
          errorCode = 'PDF_PROCESSING_TIMEOUT';
          errorMessage = 'PDF processing timed out. Try a simpler PDF or convert to TXT format.';
        } else if (error.message.includes('too large')) {
          errorCode = 'PDF_FILE_TOO_LARGE';
          errorMessage = error.message; // Already user-friendly
        } else if (error.message.includes('corrupted') || error.message.includes('Invalid PDF')) {
          errorCode = 'PDF_INVALID_FORMAT';
          errorMessage = 'PDF file appears to be corrupted. Try re-saving the PDF or converting to TXT format.';
        } else if (error.message.includes('unavailable')) {
          errorCode = 'PDF_PROCESSING_UNAVAILABLE';
          errorMessage = 'PDF processing is temporarily unavailable. Please try uploading a TXT or DOC file instead.';
        } else {
          errorCode = 'PDF_PROCESSING_FAILED';
          errorMessage = `${error.message} Suggested alternatives: TXT, DOC, or DOCX formats.`;
        }
      }
      
      // Log detailed error for debugging
      console.error('Resume upload error:', {
        errorCode,
        originalError: error.message,
        fileName,
        fileSize: fileBuffer.length,
        userId
      });

      return {
        resumeId: '',
        sessionId: session.id,
        success: false,
        error: {
          code: errorCode,
          message: errorMessage
        }
      };
    }
  }

  /**
   * Upload multiple resumes
   */
  async uploadMultipleResumes(
    files: Array<{ buffer: Buffer; fileName: string }>,
    userId: string,
    jobDescriptionId?: string
  ): Promise<BatchUploadResult> {
    // Create session for batch
    const session = this.sessionManager.createSession(userId, jobDescriptionId);

    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadResume(file.buffer, file.fileName, userId, jobDescriptionId);
      results.push(result);
    }

    // Update session with all resume IDs
    const successfulResumes = results.filter(r => r.success);
    for (const result of successfulResumes) {
      this.sessionManager.addResumeToSession(session.id, result.resumeId);
    }

    return {
      sessionId: session.id,
      total: files.length,
      successful: successfulResumes.length,
      failed: results.length - successfulResumes.length,
      results
    };
  }

  /**
   * Get resume by ID
   */
  async getResumeById(resumeId: string): Promise<ResumeMetadata | null> {
    const resume = this.resumes.get(resumeId);
    
    if (!resume) {
      return null;
    }

    // Check expiration
    if (new Date() > resume.expiresAt) {
      this.resumes.delete(resumeId);
      return null;
    }

    // Return without internal fields
    const { encryptedContent, textContent, ...metadata } = resume;
    return metadata;
  }

  /**
   * Get resume with text content (internal use)
   */
  async getResumeWithText(resumeId: string): Promise<(ResumeMetadata & { textContent?: string }) | null> {
    const resume = this.resumes.get(resumeId);
    
    if (!resume) {
      return null;
    }

    // Check expiration
    if (new Date() > resume.expiresAt) {
      this.resumes.delete(resumeId);
      return null;
    }

    return resume;
  }

  /**
   * Get processing result for a resume
   */
  async getProcessingResult(resumeId: string): Promise<ProcessingResult | null> {
    return this.processingResults.get(resumeId) || null;
  }

  /**
   * Cancel an upload
   */
  async cancelUpload(resumeId: string): Promise<boolean> {
    const resume = this.resumes.get(resumeId);
    
    if (!resume) {
      return false;
    }

    if (resume.status === 'processing') {
      return false; // Can't cancel processing resume
    }

    resume.status = 'cancelled';
    this.resumes.set(resumeId, resume);

    return true;
  }

  /**
   * Process a resume asynchronously
   */
  private async processResume(
    resumeId: string,
    text: string,
    jobDescriptionId?: string
  ): Promise<void> {
    const resume = this.resumes.get(resumeId);
    if (!resume) return;

    resume.status = 'processing';
    this.resumes.set(resumeId, resume);

    // High-impact push 3: Live Agent Status
    realtimeService.logActivity(resume.organization?.toString() || 'default', 'AI Analyzing', `Agent Gemini mining intelligence from ${resume.fileName}`);

    try {
      // If no external service configured, simulate processing
      let result: ProcessingResult;

      if (this.externalServiceClient && jobDescriptionId) {
        // Submit to external service
        result = await this.externalServiceClient.submitForProcessing(
          text,
          `Job Description ID: ${jobDescriptionId}`
        );
      } else {
        // Simulate processing result
        result = this.simulateProcessingResult(resumeId, text);
      }

      // Store result
      this.processingResults.set(resumeId, result);

      resume.status = 'completed';
      this.resumes.set(resumeId, resume);

      // Complete session if all resumes are done
      this.checkAndCompleteSession(resumeId);
    } catch (error: any) {
      resume.status = 'failed';
      this.resumes.set(resumeId, resume);

      // Store error result
      this.processingResults.set(resumeId, {
        resumeId,
        overallMatchScore: 0,
        matchedQualifications: [],
        missingQualifications: [],
        recommendations: [`Processing failed: ${error.message}`],
        processedAt: new Date()
      });
    }
  }

  /**
   * Simulate processing result for demo
   */
  private simulateProcessingResult(resumeId: string, text: string): ProcessingResult {
    const wordCount = text.split(/\s+/).length;
    
    // Simple scoring based on text length and keywords
    const keywords = ['javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker', 'kubernetes'];
    const lowerText = text.toLowerCase();
    const matchedKeywords = keywords.filter(kw => lowerText.includes(kw));
    
    const score = Math.min(100, Math.floor(50 + (matchedKeywords.length * 10) + (wordCount > 100 ? 10 : 0)));

    return {
      resumeId,
      overallMatchScore: score,
      matchedQualifications: matchedKeywords,
      missingQualifications: keywords.filter(kw => !matchedKeywords.includes(kw)),
      recommendations: [
        matchedKeywords.length >= 3 
          ? 'Strong technical profile' 
          : 'Consider adding more technical skills',
        'Review resume formatting for better readability'
      ],
      processedAt: new Date()
    };
  }

  /**
   * Check and complete session when all resumes are processed
   */
  private checkAndCompleteSession(resumeId: string): void {
    // Find session containing this resume
    for (const session of this.sessionManager['sessions']?.values() || []) {
      if (session.resumeIds.includes(resumeId)) {
        // Check if all resumes in session are completed
        const allCompleted = session.resumeIds.every(id => {
          const resume = this.resumes.get(id);
          return resume?.status === 'completed' || resume?.status === 'failed';
        });

        if (allCompleted) {
          this.sessionManager.completeSession(session.id);
        }
        break;
      }
    }
  }

  /**
   * Clean up expired resumes
   */
  async cleanupExpiredResumes(): Promise<number> {
    let cleaned = 0;
    
    for (const [id, resume] of this.resumes.entries()) {
      if (new Date() > resume.expiresAt) {
        this.resumes.delete(id);
        this.processingResults.delete(id);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get service statistics
   */
  getStats(): {
    totalResumes: number;
    processingResumes: number;
    completedResumes: number;
    failedResumes: number;
    activeSessions: number;
  } {
    let total = 0, processing = 0, completed = 0, failed = 0;
    
    for (const resume of this.resumes.values()) {
      total++;
      switch (resume.status) {
        case 'processing': processing++; break;
        case 'completed': completed++; break;
        case 'failed': failed++; break;
      }
    }

    return {
      totalResumes: total,
      processingResumes: processing,
      completedResumes: completed,
      failedResumes: failed,
      activeSessions: this.sessionManager.getActiveSessionCount()
    };
  }
  /**
   * Get PDF processing availability status
   */
  getPdfProcessingStatus(): { available: boolean; error?: string; status: string } {
    const pdfStatus = this.textExtractor.isPdfProcessingAvailable();
    return {
      ...pdfStatus,
      status: this.textExtractor.getPdfProcessingStatus()
    };
  }
}

// Create a shared instance
export const resumeUploadService = new ResumeUploadService();

export default ResumeUploadService;