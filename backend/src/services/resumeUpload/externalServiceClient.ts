import { ExternalServiceConfig, ProcessingResult } from './types';

/**
 * ExternalServiceClient - Client for external resume processing service
 * Implements retry logic with exponential backoff
 */
export class ExternalServiceClient {
  private config: ExternalServiceConfig;

  constructor(config: ExternalServiceConfig) {
    this.config = config;
  }

  /**
   * Submit a resume for processing against a job description
   */
  async submitForProcessing(
    resumeText: string,
    jobDescription: string
  ): Promise<ProcessingResult> {
    const payload = {
      resume: resumeText,
      jobDescription,
      timestamp: new Date().toISOString()
    };

    return this.executeWithRetry(
      () => this.callProcessingApi(payload),
      'submitForProcessing'
    );
  }

  /**
   * Submit multiple resumes for batch processing
   */
  async submitBatch(
    resumes: Array<{ id: string; text: string }>,
    jobDescription: string
  ): Promise<ProcessingResult[]> {
    const payload = {
      resumes: resumes.map(r => ({ id: r.id, content: r.text })),
      jobDescription,
      timestamp: new Date().toISOString()
    };

    return this.executeWithRetry(
      () => this.callBatchApi(payload),
      'submitBatch'
    );
  }

  /**
   * Get the status of a processing request
   */
  async getStatus(requestId: string): Promise<{ status: string; result?: ProcessingResult }> {
    return this.executeWithRetry(
      () => this.callStatusApi(requestId),
      'getStatus'
    );
  }

  /**
   * Execute a function with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = this.config.initialDelay;

    for (let attempt = 1; attempt <= this.config.maxRetries + 1; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          throw error;
        }

        // Don't wait after the last attempt
        if (attempt <= this.config.maxRetries) {
          console.log(
            `[ExternalServiceClient] ${operationName} attempt ${attempt} failed, ` +
            `retrying in ${delay}ms...`
          );

          await this.sleep(delay);

          // Exponential backoff with jitter
          delay = Math.min(delay * this.config.backoffMultiplier, this.config.maxDelay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: any): boolean {
    // Network errors are retryable
    if (error.code === 'ECONNRESET' || 
        error.code === 'ETIMEDOUT' || 
        error.code === 'ENOTFOUND') {
      return true;
    }

    // 5xx server errors are retryable
    if (error.status >= 500) {
      return true;
    }

    // 429 rate limit is retryable
    if (error.status === 429) {
      return true;
    }

    return false;
  }

  /**
   * Call the processing API
   */
  private async callProcessingApi(payload: any): Promise<ProcessingResult> {
    const response = await fetch(`${this.config.baseUrl}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-Request-ID': this.generateRequestId()
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.config.timeout)
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw error;
    }

    return response.json();
  }

  /**
   * Call the batch processing API
   */
  private async callBatchApi(payload: any): Promise<ProcessingResult[]> {
    const response = await fetch(`${this.config.baseUrl}/process/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-Request-ID': this.generateRequestId()
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.config.timeout)
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw error;
    }

    return response.json();
  }

  /**
   * Call the status API
   */
  private async callStatusApi(requestId: string): Promise<{ status: string; result?: ProcessingResult }> {
    const response = await fetch(`${this.config.baseUrl}/status/${requestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-Request-ID': this.generateRequestId()
      },
      signal: AbortSignal.timeout(this.config.timeout)
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw error;
    }

    return response.json();
  }

  /**
   * Parse error response
   */
  private async parseError(response: Response): Promise<Error> {
    const errorData = await response.json().catch(() => ({}));
    
    const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    (error as any).status = response.status;
    (error as any).code = errorData.code || 'UNKNOWN_ERROR';
    
    return error;
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Sleep for a given duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get configuration
   */
  getConfig(): ExternalServiceConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ExternalServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export default ExternalServiceClient;