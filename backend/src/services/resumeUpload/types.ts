/**
 * Resume Upload Service Types
 * Core type definitions for resume upload and processing functionality
 */

export type ResumeFormat = 'pdf' | 'doc' | 'docx' | 'txt';

export type UploadStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired';

export type SessionStatus = 
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'expired';

export interface ResumeMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  format: ResumeFormat;
  mimeType: string;
  uploadedAt: Date;
  expiresAt: Date;
  userId: string;
  status: UploadStatus;
  jobDescriptionIds: string[];
  organization?: string;
}

export interface UploadResult {
  resumeId: string;
  sessionId: string;
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}

export interface BatchUploadResult {
  sessionId: string;
  total: number;
  successful: number;
  failed: number;
  results: UploadResult[];
}

export interface ProcessingResult {
  resumeId: string;
  overallMatchScore: number;
  matchedQualifications: string[];
  missingQualifications: string[];
  recommendations: string[];
  processedAt: Date;
}

export interface JobDescription {
  id: string;
  title: string;
  requirements: string[];
  preferredQualifications: string[];
  responsibilities: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadSession {
  id: string;
  userId: string;
  status: SessionStatus;
  resumeIds: string[];
  jobDescriptionId?: string;
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
}

export interface ResumeUploadConfig {
  maxFileSize: number; // in bytes
  allowedFormats: ResumeFormat[];
  sessionExpirationHours: number;
  retentionDays: number;
  rateLimitPerHour: number;
  encryptionEnabled: boolean;
}

export interface FileValidationResult {
  valid: boolean;
  format?: ResumeFormat;
  mimeType?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface TextExtractionResult {
  text: string;
  sections?: {
    header?: string;
    experience?: string;
    education?: string;
    skills?: string;
  };
  wordCount: number;
}

export interface ExternalServiceConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}