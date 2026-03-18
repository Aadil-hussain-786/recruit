import { ResumeUploadConfig, FileValidationResult, ResumeFormat } from './types';

/**
 * FileValidator - Validates uploaded resume files for format and size
 */
export class FileValidator {
  private config: ResumeUploadConfig;

  constructor(config: ResumeUploadConfig) {
    this.config = config;
  }

  /**
   * Validate a file buffer against supported formats and size limits
   */
  validate(buffer: Buffer, fileName: string): FileValidationResult {
    // Check file size
    if (!this.isWithinSizeLimit(buffer.length)) {
      return {
        valid: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds maximum limit of ${this.config.maxFileSize} bytes`
        }
      };
    }

    // Detect format from magic bytes and file extension
    const format = this.detectFormat(buffer, fileName);
    
    if (!format) {
      return {
        valid: false,
        error: {
          code: 'UNSUPPORTED_FORMAT',
          message: 'Unsupported file format. Allowed formats: PDF, DOC, DOCX, TXT'
        }
      };
    }

    // Validate format is in allowed list
    if (!this.config.allowedFormats.includes(format)) {
      return {
        valid: false,
        error: {
          code: 'FORMAT_NOT_ALLOWED',
          message: `Format '${format}' is not allowed. Allowed formats: ${this.config.allowedFormats.join(', ')}`
        }
      };
    }

    return {
      valid: true,
      format,
      mimeType: this.getMimeType(format)
    };
  }

  /**
   * Check if file format is supported based on magic bytes
   */
  isSupportedFormat(buffer: Buffer, fileName: string): boolean {
    const format = this.detectFormat(buffer, fileName);
    return format !== undefined && this.config.allowedFormats.includes(format);
  }

  /**
   * Check if file size is within limits
   */
  isWithinSizeLimit(fileSize: number): boolean {
    return fileSize <= this.config.maxFileSize;
  }

  /**
   * Detect file format from magic bytes and extension
   */
  private detectFormat(buffer: Buffer, fileName: string): ResumeFormat | undefined {
    // Check magic bytes first
    const format = this.detectFromMagicBytes(buffer);
    if (format) {
      return format;
    }

    // Fall back to file extension
    return this.detectFromExtension(fileName);
  }

  /**
   * Detect format from file magic bytes
   */
  private detectFromMagicBytes(buffer: Buffer): ResumeFormat | undefined {
    if (buffer.length < 4) {
      return undefined;
    }

    // PDF: %PDF (0x25 0x50 0x44 0x46)
    if (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    ) {
      return 'pdf';
    }

    // DOCX: PK (ZIP format) - 0x50 0x4B 0x03 0x04
    if (
      buffer[0] === 0x50 &&
      buffer[1] === 0x4B &&
      buffer[2] === 0x03 &&
      buffer[3] === 0x04
    ) {
      return 'docx';
    }

    // DOC: MS Word old format (0xD0 0xCF 0x11 0xE0)
    if (
      buffer[0] === 0xD0 &&
      buffer[1] === 0xCF &&
      buffer[2] === 0x11 &&
      buffer[3] === 0xE0
    ) {
      return 'doc';
    }

    return undefined;
  }

  /**
   * Detect format from file extension
   */
  private detectFromExtension(fileName: string): ResumeFormat | undefined {
    const ext = fileName.toLowerCase().split('.').pop();
    
    switch (ext) {
      case 'pdf':
        return 'pdf';
      case 'doc':
        return 'doc';
      case 'docx':
        return 'docx';
      case 'txt':
        return 'txt';
      default:
        return undefined;
    }
  }

  /**
   * Get MIME type for a format
   */
  private getMimeType(format: ResumeFormat): string {
    switch (format) {
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Get configuration
   */
  getConfig(): ResumeUploadConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ResumeUploadConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export default FileValidator;