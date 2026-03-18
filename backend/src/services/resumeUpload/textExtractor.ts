import mammoth from 'mammoth';
import { TextExtractionResult, ResumeFormat } from './types';

// Try to load pdf-parse with different approaches and enhanced error handling
let pdfParse: any;
let pdfParseAvailable = false;
let pdfParseError: string | null = null;

try {
  const mod = require('pdf-parse');
  pdfParse = mod.default || mod;
  pdfParseAvailable = true;
  console.log('PDF processing: pdf-parse module loaded successfully');
} catch (error: any) {
  try {
    const mod = require('pdf-parse/lib/pdf-parse.js');
    pdfParse = mod.default || mod;
    pdfParseAvailable = true;
    console.log('PDF processing: pdf-parse module loaded from lib path');
  } catch (fallbackError: any) {
    pdfParseError = `pdf-parse module not available: ${error.message}`;
    console.warn('PDF processing warning:', pdfParseError);

    // Create fallback function that provides clear error
    pdfParse = async (buffer: Buffer) => {
      throw new Error('PDF processing is currently unavailable. Please try uploading a TXT or DOC file instead, or contact support if you need PDF processing.');
    };
  }
}

/**
 * TextExtractor - Extracts text from resume files in various formats
 */
export class TextExtractor {
  /**
   * Extract text from a file buffer
   */
  async extractText(buffer: Buffer, format: ResumeFormat): Promise<TextExtractionResult> {
    // Validate input
    if (!buffer || buffer.length === 0) {
      throw new Error('File buffer is empty or invalid');
    }

    switch (format) {
      case 'pdf':
        // Check if PDF processing is available before attempting
        if (!pdfParseAvailable) {
          throw new Error(`PDF processing is currently unavailable: ${pdfParseError}. Please try uploading a TXT or DOC file instead.`);
        }
        return this.extractFromPdf(buffer);
      case 'doc':
      case 'docx':
        return this.extractFromDoc(buffer);
      case 'txt':
        return this.extractFromText(buffer);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Extract text with formatting information
   */
  async extractWithFormatting(buffer: Buffer, format: ResumeFormat): Promise<TextExtractionResult> {
    const result = await this.extractText(buffer, format);
    
    // Parse sections from extracted text
    const sections = this.parseSections(result.text);
    
    return {
      ...result,
      sections
    };
  }

  /**
   * Extract text from PDF
   */
  /**
     * Extract text from PDF with enhanced error handling
     */
    private async extractFromPdf(buffer: Buffer): Promise<TextExtractionResult> {
      // Validate input buffer
      if (!buffer || buffer.length === 0) {
        throw new Error('PDF file is empty or invalid');
      }

      // Check file size limits (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (buffer.length > maxSize) {
        throw new Error(`PDF file too large (${Math.round(buffer.length / 1024 / 1024)}MB). Maximum size is 10MB.`);
      }

      // Validate PDF header
      const pdfHeader = buffer.slice(0, 8).toString('ascii');
      if (!pdfHeader.startsWith('%PDF-')) {
        throw new Error('Invalid PDF file format. Please ensure the file is a valid PDF.');
      }

      try {
        // Set timeout for PDF processing (60 seconds for larger files)
        const timeoutMs = buffer.length > 2 * 1024 * 1024 ? 60000 : 30000; // 60s for files > 2MB, 30s otherwise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`PDF processing timeout (${timeoutMs / 1000}s). File may be too complex.`)), timeoutMs);
        });

        // Process PDF with timeout and memory monitoring
        const pdfPromise = this.processPdfWithFallback(buffer);
        const data = await Promise.race([pdfPromise, timeoutPromise]);

        const text = data.text || '';

        // Validate extracted text
        if (!text.trim()) {
          throw new Error('No text content could be extracted from the PDF. The file may be image-based or encrypted.');
        }

        return {
          text: text.trim(),
          wordCount: this.countWords(text)
        };
      } catch (error: any) {
        // Enhanced error handling with specific error types
        if (error.message.includes('timeout')) {
          throw new Error('PDF processing timed out. The file may be too complex or large. Try a simpler PDF or convert to TXT format.');
        } else if (error.message.includes('Invalid PDF structure') || error.message.includes('Invalid PDF')) {
          throw new Error('PDF file appears to be corrupted or uses an unsupported format. Try re-saving the PDF or converting to TXT format.');
        } else if (error.message.includes('Memory allocation') || error.message.includes('out of memory')) {
          throw new Error('PDF file is too complex to process. Try reducing the file size or converting to TXT format.');
        } else if (error.message.includes('pdf-parse module not available') || error.message.includes('unavailable')) {
          throw new Error('PDF processing is temporarily unavailable. Please try uploading a TXT or DOC file instead.');
        } else if (error.message.includes('No text content could be extracted')) {
          throw new Error('This PDF appears to be image-based or encrypted. Try converting to TXT format or use OCR software first.');
        } else {
          // Log detailed error for debugging
          console.error('PDF processing error:', {
            error: error.message,
            fileSize: buffer.length,
            pdfHeader: pdfHeader
          });

          throw new Error(`Unable to process PDF file: ${error.message}. Try converting to TXT or DOC format for better compatibility.`);
        }
      }
    }
    /**
     * Process PDF with fallback mechanisms and retry
     */
    private async processPdfWithFallback(buffer: Buffer, maxRetries: number = 3): Promise<{ text: string; info?: any }> {
      const errors: string[] = [];
      let lastError: Error | null = null;

      // Validate PDF buffer before processing
      if (!buffer || buffer.length === 0) {
        throw new Error('PDF buffer is empty');
      }

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Primary method: pdf-parse
          const data = await pdfParse(buffer);
          if (data.text && data.text.trim().length > 0) {
            return data;
          }
          errors.push(`Attempt ${attempt}: pdf-parse: No text content extracted`);
        } catch (error: any) {
          lastError = error;
          errors.push(`Attempt ${attempt}: pdf-parse: ${error.message}`);
          
          // If it's a timeout, increase wait time before retry
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          }
        }
      }

      // All retries exhausted
      const errorSummary = errors.join('; ');
      throw new Error(`PDF processing failed after ${maxRetries} attempts: ${errorSummary}. Please try: 1) Converting to TXT format, 2) Re-saving the PDF, or 3) Providing text content manually.`);
    }

    /**
     * Extract basic PDF metadata when text extraction fails
     */
    private async extractPdfMetadata(buffer: Buffer): Promise<any> {
      try {
        // Try to extract basic info using pdf-parse info mode
        const data = await pdfParse(buffer, { max: 0 });
        return data.info || {};
      } catch (error) {
        // Basic PDF structure parsing for metadata
        const pdfString = buffer.toString('binary');
        const metadata: any = {};

        // Extract title
        const titleMatch = pdfString.match(/\/Title\s*\(([^)]+)\)/);
        if (titleMatch) metadata.title = titleMatch[1];

        // Extract subject
        const subjectMatch = pdfString.match(/\/Subject\s*\(([^)]+)\)/);
        if (subjectMatch) metadata.subject = subjectMatch[1];

        // Extract keywords
        const keywordsMatch = pdfString.match(/\/Keywords\s*\(([^)]+)\)/);
        if (keywordsMatch) metadata.keywords = keywordsMatch[1];

        // Extract creator
        const creatorMatch = pdfString.match(/\/Creator\s*\(([^)]+)\)/);
        if (creatorMatch) metadata.creator = creatorMatch[1];

        return metadata;
      }
    }

  /**
   * Extract text from Word documents
   */
  private async extractFromDoc(buffer: Buffer): Promise<TextExtractionResult> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value || '';
      
      return {
        text: text.trim(),
        wordCount: this.countWords(text)
      };
    } catch (error: any) {
      throw new Error(`Failed to extract text from Word document: ${error.message}`);
    }
  }

  /**
   * Extract text from plain text files
   */
  private extractFromText(buffer: Buffer): TextExtractionResult {
    const text = buffer.toString('utf-8').trim();
    
    return {
      text,
      wordCount: this.countWords(text)
    };
  }

  /**
   * Parse sections from resume text
   */
  private parseSections(text: string): TextExtractionResult['sections'] {
    const sections: TextExtractionResult['sections'] = {};
    
    // Common section headers in resumes
    const sectionPatterns: Record<string, RegExp[]> = {
      header: [
        /^(?:name|contact|email|phone|address)[:\s]*(.*)$/im,
        /^(?:[A-Z][a-z]+\s[A-Z][a-z]+)$/m  // Name pattern
      ],
      experience: [
        /(?:experience|work history|employment)[:\s]*(.*)$/im,
        /(?:\d{4})\s*[-–]\s*(?:present|current)/gi
      ],
      education: [
        /(?:education|academic|qualifications)[:\s]*(.*)$/im,
        /(?:bachelor|master|phd|degree|university|college)/gi
      ],
      skills: [
        /(?:skills|technical skills|competencies)[:\s]*(.*)$/im,
        /(?:javascript|python|react|node|sql|aws|docker|kubernetes)/gi
      ]
    };

    // Simple section extraction based on keywords
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('experience') || lowerText.includes('work history')) {
      sections.experience = this.extractSection(text, 'experience');
    }
    
    if (lowerText.includes('education') || lowerText.includes('academic')) {
      sections.education = this.extractSection(text, 'education');
    }
    
    if (lowerText.includes('skills') || lowerText.includes('technical skills')) {
      sections.skills = this.extractSection(text, 'skills');
    }

    return sections;
  }

  /**
   * Extract a specific section from text
   */
  private extractSection(text: string, sectionName: string): string {
    const sectionPatterns: Record<string, RegExp[]> = {
      experience: [
        /(?:experience|work history|employment)[:\s]*([\s\S]*?)(?=(?:education|skills|projects|$))/i,
        /([\s\S]{0,2000})/i
      ],
      education: [
        /(?:education|academic|qualifications)[:\s]*([\s\S]*?)(?=(?:experience|skills|projects|$))/i
      ],
      skills: [
        /(?:skills|technical skills|competencies)[:\s]*([\s\S]*?)(?=(?:experience|education|projects|$))/i
      ]
    };

    const patterns = sectionPatterns[sectionName] || [];
    
    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return '';
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

    /**
     * Check if PDF processing is available
     */
    isPdfProcessingAvailable(): { available: boolean; error?: string } {
      return {
        available: pdfParseAvailable,
        error: pdfParseError || undefined
      };
    }

    /**
     * Get PDF processing status for diagnostics
     */
    getPdfProcessingStatus(): string {
      if (pdfParseAvailable) {
        return 'PDF processing: Available (pdf-parse module loaded)';
      } else {
        return `PDF processing: Unavailable - ${pdfParseError}`;
      }
    }
}

export default TextExtractor;