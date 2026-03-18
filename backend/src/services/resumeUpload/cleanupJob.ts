import { ResumeUploadService } from './resumeUploadService';
import { SessionManager } from './sessionManager';

/**
 * Cleanup Job - Scheduled task to clean up expired resumes and sessions
 */
export class CleanupJob {
  private resumeUploadService: ResumeUploadService;
  private sessionManager: SessionManager;
  private intervalId: NodeJS.Timeout | null = null;
  private intervalMs: number;

  constructor(
    resumeUploadService: ResumeUploadService,
    sessionManager: SessionManager,
    intervalMs: number = 60 * 60 * 1000 // Default: 1 hour
  ) {
    this.resumeUploadService = resumeUploadService;
    this.sessionManager = sessionManager;
    this.intervalMs = intervalMs;
  }

  /**
   * Start the cleanup job
   */
  start(): void {
    if (this.intervalId) {
      console.log('[CleanupJob] Already running');
      return;
    }

    console.log(`[CleanupJob] Starting with interval: ${this.intervalMs}ms`);

    // Run immediately
    this.run();

    // Schedule periodic runs
    this.intervalId = setInterval(() => {
      this.run();
    }, this.intervalMs);
  }

  /**
   * Stop the cleanup job
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[CleanupJob] Stopped');
    }
  }

  /**
   * Run cleanup tasks
   */
  async run(): Promise<{
    resumesCleaned: number;
    sessionsCleaned: number;
    timestamp: Date;
  }> {
    const timestamp = new Date();
    console.log(`[CleanupJob] Running at ${timestamp.toISOString()}`);

    try {
      // Clean up expired resumes
      const resumesCleaned = await this.resumeUploadService.cleanupExpiredResumes();
      console.log(`[CleanupJob] Cleaned ${resumesCleaned} expired resumes`);

      // Clean up expired sessions
      const sessionsCleaned = this.sessionManager.forceCleanupExpiredSessions();
      console.log(`[CleanupJob] Cleaned ${sessionsCleaned} expired sessions`);

      return {
        resumesCleaned,
        sessionsCleaned,
        timestamp
      };
    } catch (error: any) {
      console.error('[CleanupJob] Error during cleanup:', error.message);
      return {
        resumesCleaned: 0,
        sessionsCleaned: 0,
        timestamp
      };
    }
  }

  /**
   * Get cleanup job status
   */
  getStatus(): {
    running: boolean;
    intervalMs: number;
  } {
    return {
      running: this.intervalId !== null,
      intervalMs: this.intervalMs
    };
  }
}

/**
 * Create and start the cleanup job
 */
export function startCleanupJob(
  resumeUploadService: ResumeUploadService,
  sessionManager: SessionManager,
  intervalHours: number = 1
): CleanupJob {
  const job = new CleanupJob(
    resumeUploadService,
    sessionManager,
    intervalHours * 60 * 60 * 1000
  );
  
  job.start();
  
  return job;
}

export default CleanupJob;