import { v4 as uuidv4 } from 'uuid';
import { UploadSession, SessionStatus } from './types';

/**
 * SessionManager - Manages upload sessions for resume uploads
 */
export class SessionManager {
  private sessions: Map<string, UploadSession> = new Map();
  private sessionExpirationHours: number;

  constructor(sessionExpirationHours: number = 24) {
    this.sessionExpirationHours = sessionExpirationHours;
  }

  /**
   * Create a new upload session
   */
  createSession(userId: string, jobDescriptionId?: string): UploadSession {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.sessionExpirationHours * 60 * 60 * 1000);

    const session: UploadSession = {
      id: uuidv4(),
      userId,
      status: 'active',
      resumeIds: [],
      jobDescriptionId,
      createdAt: now,
      expiresAt
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Add a resume to a session
   */
  addResumeToSession(sessionId: string, resumeId: string): UploadSession | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    if (session.status !== 'active') {
      return null;
    }

    session.resumeIds.push(resumeId);
    this.sessions.set(sessionId, session);
    
    return session;
  }

  /**
   * Get a session by ID
   */
  getSession(sessionId: string): UploadSession | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    // Check if session has expired
    if (this.isExpired(session)) {
      session.status = 'expired';
      this.sessions.set(sessionId, session);
      return null;
    }

    return session;
  }

  /**
   * Cancel a session
   */
  cancelSession(sessionId: string): UploadSession | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    if (session.status !== 'active') {
      return null;
    }

    session.status = 'cancelled';
    session.completedAt = new Date();
    this.sessions.set(sessionId, session);
    
    return session;
  }

  /**
   * Mark session as completed
   */
  completeSession(sessionId: string): UploadSession | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    session.status = 'completed';
    session.completedAt = new Date();
    this.sessions.set(sessionId, session);
    
    return session;
  }

  /**
   * Get all sessions for a user
   */
  getUserSessions(userId: string): UploadSession[] {
    const userSessions: UploadSession[] = [];
    
    for (const session of this.sessions.values()) {
      if (session.userId === userId) {
        // Check expiration
        if (this.isExpired(session)) {
          session.status = 'expired';
          this.sessions.set(session.id, session);
        } else {
          userSessions.push(session);
        }
      }
    }
    
    return userSessions;
  }

  /**
   * Get active sessions for a user
   */
  getActiveUserSessions(userId: string): UploadSession[] {
    return this.getUserSessions(userId).filter(s => s.status === 'active');
  }

  /**
   * Check if a session is expired
   */
  isExpired(session: UploadSession): boolean {
    return new Date() > session.expiresAt;
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): number {
    let cleaned = 0;
    
    for (const [id, session] of this.sessions.entries()) {
      if (this.isExpired(session)) {
        session.status = 'expired';
        this.sessions.set(id, session);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  /**
   * Force remove expired sessions from memory
   */
  forceCleanupExpiredSessions(): number {
    let removed = 0;
    
    for (const [id, session] of this.sessions.entries()) {
      if (this.isExpired(session)) {
        this.sessions.delete(id);
        removed++;
      }
    }
    
    return removed;
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Get active session count
   */
  getActiveSessionCount(): number {
    let count = 0;
    for (const session of this.sessions.values()) {
      if (session.status === 'active' && !this.isExpired(session)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Clear all sessions (for testing)
   */
  clearAllSessions(): void {
    this.sessions.clear();
  }
}

export default SessionManager;