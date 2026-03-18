import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Rate limiter middleware for resume uploads
 * Limits uploads per user per hour
 */
export class RateLimiter {
  private uploads: Map<string, { count: number; resetTime: Date }> = new Map();
  private maxUploads: number;
  private windowMs: number;

  constructor(maxUploads: number = 100, windowMs: number = 60 * 60 * 1000) {
    this.maxUploads = maxUploads;
    this.windowMs = windowMs;
  }

  /**
   * Express middleware for rate limiting
   */
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as any).user?._id || (req as any).user?.id || this.getClientIp(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const now = new Date();
      const record = this.uploads.get(userId);

      if (!record || now >= record.resetTime) {
        // Start new window
        this.uploads.set(userId, {
          count: 1,
          resetTime: new Date(now.getTime() + this.windowMs)
        });
      } else {
        // Check limit
        if (record.count >= this.maxUploads) {
          const retryAfter = Math.ceil((record.resetTime.getTime() - now.getTime()) / 1000);
          
          res.set('Retry-After', String(retryAfter));
          res.set('X-RateLimit-Limit', String(this.maxUploads));
          res.set('X-RateLimit-Remaining', '0');
          res.set('X-RateLimit-Reset', String(Math.ceil(record.resetTime.getTime() / 1000)));
          
          return res.status(429).json({
            success: false,
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter,
            limit: this.maxUploads
          });
        }

        // Increment count
        record.count++;
      }

      // Add rate limit headers
      const currentRecord = this.uploads.get(userId)!;
      res.set('X-RateLimit-Limit', String(this.maxUploads));
      res.set('X-RateLimit-Remaining', String(this.maxUploads - currentRecord.count));
      res.set('X-RateLimit-Reset', String(Math.ceil(currentRecord.resetTime.getTime() / 1000)));

      next();
    };
  }

  /**
   * Get client IP address
   */
  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim();
    }
    return req.socket?.remoteAddress || 'unknown';
  }

  /**
   * Get current count for a user
   */
  getUserCount(userId: string): { count: number; remaining: number; resetTime: Date } | null {
    const record = this.uploads.get(userId);
    if (!record) return null;

    return {
      count: record.count,
      remaining: Math.max(0, this.maxUploads - record.count),
      resetTime: record.resetTime
    };
  }

  /**
   * Reset limit for a user (admin function)
   */
  resetLimit(userId: string): boolean {
    return this.uploads.delete(userId);
  }

  /**
   * Clear all limits (for testing)
   */
  clearAll(): void {
    this.uploads.clear();
  }

  /**
   * Get total tracked users
   */
  getTrackedUserCount(): number {
    return this.uploads.size;
  }
}

// Export singleton instance
export const resumeUploadRateLimiter = new RateLimiter(100, 60 * 60 * 1000); // 100 uploads per hour

export default RateLimiter;