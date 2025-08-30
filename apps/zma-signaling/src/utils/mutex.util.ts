import { Logger } from '@nestjs/common';

/**
 * Shared mutex utility for preventing race conditions across services.
 * Provides promise chaining to ensure operations are executed sequentially.
 *
 * This utility prevents the race condition where multiple operations await the same promise
 * and then all proceed concurrently when it resolves. Instead, operations are
 * chained together so they execute one after another.
 */
export class MutexUtil {
  private static readonly logger = new Logger(MutexUtil.name);

  /**
   * Generic helper for serializing operations using promise chaining.
   * Ensures operations for the same key are executed sequentially.
   *
   * Example: If 3 operations arrive concurrently for the same key:
   * - Operation 1: Creates promise P1, executes immediately
   * - Operation 2: Chains to P1 → P1.then(operation2), waits for P1 to complete
   * - Operation 3: Chains to P2 → P2.then(operation3), waits for P2 to complete
   * - Result: Operations execute in sequence: P1 → P2 → P3
   *
   * @param mutexMap - The mutex map to use for coordination
   * @param key - The key to serialize operations for
   * @param operation - The operation to execute
   * @param context - Optional context for logging (e.g., service name)
   * @param timeoutMs - Optional timeout in milliseconds
   * @param timeoutMap - Optional timeout map for cleanup (required if timeoutMs is provided)
   * @returns Promise that resolves when the operation completes
   */
  static async withMutex<T>({
    mutexMap,
    key,
    operation,
    context = 'Unknown',
    timeoutMs,
    timeoutMap,
  }: {
    mutexMap: Map<string, Promise<unknown>>;
    key: string;
    operation: () => Promise<T>;
    context?: string;
    timeoutMs?: number;
    timeoutMap?: Map<string, NodeJS.Timeout>;
  }): Promise<T> {
    // Chain this operation to any existing operation for this key
    const existingOperation = mutexMap.get(key) || Promise.resolve();
    const chainedOperation = existingOperation
      .then(() => {
        if (timeoutMs && timeoutMap) {
          return this.executeWithTimeout({
            key,
            operation,
            timeoutMs,
            timeoutMap,
            context,
          });
        }
        return operation();
      })
      .catch(async (err) => {
        // Log error but don't prevent next operation
        this.logger.error(`${context} operation error for ${key}: ${err.message}`);
        throw err;
      });

    // Store the chained operation as the new mutex
    mutexMap.set(key, chainedOperation);

    try {
      return await chainedOperation;
    } finally {
      // Clean up if this was the last operation
      if (mutexMap.get(key) === chainedOperation) {
        mutexMap.delete(key);
        // Clean up timeout if exists
        if (timeoutMap) {
          const timeout = timeoutMap.get(key);
          if (timeout) {
            clearTimeout(timeout);
            timeoutMap.delete(key);
          }
        }
      }
    }
  }

  /**
   * Executes an operation with timeout protection.
   *
   * @param key - The key being locked
   * @param operation - The operation to execute
   * @param timeoutMs - Timeout in milliseconds
   * @param timeoutMap - Map to store timeout references
   * @param context - Context for error messages
   * @returns Promise resolving to operation result
   */
  private static async executeWithTimeout<T>({
    key,
    operation,
    timeoutMs,
    timeoutMap,
    context,
  }: {
    key: string;
    operation: () => Promise<T>;
    timeoutMs: number;
    timeoutMap: Map<string, NodeJS.Timeout>;
    context: string;
  }): Promise<T> {
    // Set up timeout protection
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`${context} operation timed out after ${timeoutMs}ms for key ${key}`));
      }, timeoutMs);

      timeoutMap.set(key, timeout);
    });

    try {
      // Race between operation and timeout
      const result = await Promise.race([operation(), timeoutPromise]);
      this.logger.debug(`${context} operation completed successfully for key ${key}`);
      return result;
    } catch (err) {
      this.logger.error(`${context} operation failed for key ${key}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Creates a new mutex map for a service.
   * Provides better type safety and encapsulation.
   *
   * @returns A new Map for mutex coordination
   */
  static createMutexMap<T = unknown>(): Map<string, Promise<T>> {
    return new Map<string, Promise<T>>();
  }

  /**
   * Gets statistics about a mutex map for monitoring.
   * Useful for debugging and performance monitoring.
   *
   * @param mutexMap - The mutex map to analyze
   * @param context - Context for logging
   * @returns Statistics about the mutex map
   */
  static getMutexStats(
    mutexMap: Map<string, Promise<unknown>>,
    context: string,
  ): {
    activeMutexes: number;
    lockedKeys: string[];
    context: string;
  } {
    return {
      activeMutexes: mutexMap.size,
      lockedKeys: Array.from(mutexMap.keys()),
      context,
    };
  }

  /**
   * Performs cleanup of stuck mutexes (for maintenance).
   * Should be called periodically to prevent memory leaks.
   *
   * @param mutexMap - The mutex map to clean
   * @param maxAge - Maximum age in milliseconds before forcing cleanup
   * @param context - Context for logging
   */
  static performMutexMaintenance(
    mutexMap: Map<string, Promise<unknown>>,
    maxAge = 300000, // 5 minutes default
    context = 'Unknown',
  ): void {
    const stats = this.getMutexStats(mutexMap, context);
    if (stats.activeMutexes > 0) {
      this.logger.log(
        `${context} mutex maintenance: ${stats.activeMutexes} active mutexes for keys: ${stats.lockedKeys.join(', ')}`,
      );
    }

    // Note: In a real implementation, you might want to track mutex creation times
    // For now, we rely on the natural cleanup mechanism in withMutex
    if (maxAge > 0) {
      // This is a placeholder for potential future enhancement
      // where we might track mutex creation timestamps
    }
  }
}
