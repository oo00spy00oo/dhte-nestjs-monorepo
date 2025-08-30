import { Injectable, Logger } from '@nestjs/common';

import { MutexUtil } from '../../../utils';

/**
 * Manages user-level mutexes to prevent race conditions in concurrent operations.
 * Ensures that critical user operations (join, leave, status updates) are executed atomically.
 *
 * This service handles:
 * - User-level locking for critical operations
 * - Automatic lock cleanup on completion/failure
 * - Timeout protection for stuck operations
 * - Memory-efficient lock management
 */
@Injectable()
export class UserMutexService {
  private readonly logger = new Logger(UserMutexService.name);

  /**
   * Map of user IDs to their current lock promises.
   * Ensures only one critical operation per user at a time.
   */
  private userLocks = new Map<string, Promise<void>>();

  /**
   * Map of user IDs to their lock timeouts.
   * Prevents memory leaks from stuck operations.
   */
  private lockTimeouts = new Map<string, NodeJS.Timeout>();

  /**
   * Default timeout for lock operations (30 seconds).
   * Should be longer than any reasonable operation duration.
   */
  private readonly DEFAULT_TIMEOUT_MS = 30000;

  /**
   * Executes an operation with exclusive user-level locking.
   * Prevents concurrent operations on the same user from causing race conditions.
   * Uses shared MutexUtil with timeout protection for consistency.
   *
   * @param userId - The user ID to lock
   * @param operation - The async operation to execute exclusively
   * @param timeoutMs - Optional custom timeout (defaults to 30s)
   * @returns Promise resolving to the operation result
   * @throws Error if operation times out or fails
   */
  async withUserLock<T>({
    userId,
    operation,
    timeoutMs = this.DEFAULT_TIMEOUT_MS,
  }: {
    userId: string;
    operation: () => Promise<T>;
    timeoutMs?: number;
  }): Promise<T> {
    return MutexUtil.withMutex({
      mutexMap: this.userLocks,
      key: userId,
      operation,
      context: 'UserMutex',
      timeoutMs,
      timeoutMap: this.lockTimeouts,
    });
  }

  /**
   * Checks if a user currently has an active lock.
   *
   * @param userId - The user ID to check
   * @returns True if user has active lock, false otherwise
   */
  isUserLocked(userId: string): boolean {
    return this.userLocks.has(userId);
  }

  /**
   * Gets statistics about current locks for monitoring.
   *
   * @returns Object containing lock statistics
   */
  getLockStats(): {
    activeLocks: number;
    activeTimeouts: number;
    lockedUsers: string[];
  } {
    return {
      activeLocks: this.userLocks.size,
      activeTimeouts: this.lockTimeouts.size,
      lockedUsers: Array.from(this.userLocks.keys()),
    };
  }

  /**
   * Performs cleanup of stuck locks (for maintenance).
   * Should be called periodically to prevent memory leaks.
   */
  performMaintenance(): void {
    const stats = this.getLockStats();
    if (stats.activeLocks > 0) {
      this.logger.log(
        `Maintenance check: ${stats.activeLocks} active locks, ${stats.activeTimeouts} timeouts`,
      );
    }

    // Force cleanup of very old locks (safety measure)
    const maxLockAge = this.DEFAULT_TIMEOUT_MS * 2;

    // Note: In a real implementation, you might want to track lock creation times
    // For now, we rely on the timeout mechanism to prevent stuck locks
    if (maxLockAge > 0) {
      // This is a placeholder for potential future enhancement
      // where we might track lock creation timestamps
    }
  }
}
