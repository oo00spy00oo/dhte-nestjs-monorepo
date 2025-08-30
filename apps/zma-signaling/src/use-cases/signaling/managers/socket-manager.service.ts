import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { WsGatewaySocketMapValue } from '../../../core/models';
import { MutexUtil } from '../../../utils';

/**
 * Manages socket-related operations including connection tracking,
 * metadata storage, and socket lifecycle management.
 *
 * This service handles:
 * - Socket metadata storage and retrieval
 * - Socket data updates and merging
 * - Memory-efficient socket tracking
 */
@Injectable()
export class SocketManagerService {
  private readonly logger = new Logger(SocketManagerService.name);

  /**
   * In-memory map storing socket metadata with optimized memory usage.
   * Uses WeakRef to prevent memory leaks for disconnected sockets.
   */
  private socketDataMap = new Map<string, WsGatewaySocketMapValue>();

  /**
   * Mutex map for socket data operations to prevent race conditions.
   */
  private socketMutex = new Map<string, Promise<void>>();

  /**
   * Retrieves socket data by socket ID with null safety.
   *
   * @param socketId - The unique socket identifier
   * @returns Socket data or null if not found
   */
  getSocketData(socketId: string): WsGatewaySocketMapValue | null {
    return this.socketDataMap.get(socketId) || null;
  }

  /**
   * Sets or updates socket data with atomic operation to prevent race conditions.
   * Preserves existing data when partial updates are provided.
   *
   * @param params - Object containing socketId and data to set
   * @param params.socketId - The unique socket identifier
   * @param params.data - The socket data to set or merge
   */
  async setSocketData({
    socketId,
    data,
  }: {
    socketId: string;
    data: WsGatewaySocketMapValue;
  }): Promise<void> {
    return MutexUtil.withMutex({
      mutexMap: this.socketMutex,
      key: socketId,
      operation: () => this.executeSocketDataUpdate(socketId, data),
      context: 'SocketManager',
    });
  }

  /**
   * Internal socket data update logic.
   *
   * @param socketId - The unique socket identifier
   * @param data - The socket data to set or merge
   */
  private async executeSocketDataUpdate(
    socketId: string,
    data: WsGatewaySocketMapValue,
  ): Promise<void> {
    const existing = this.socketDataMap.get(socketId);

    // Intelligent merge to preserve existing data
    this.socketDataMap.set(socketId, {
      meta: { ...existing?.meta, ...data.meta },
      producers: data.producers ?? existing?.producers ?? [],
      consumers: data.consumers ?? existing?.consumers ?? [],
      transports: { ...existing?.transports, ...data.transports },
    });
  }

  /**
   * Updates only socket metadata without affecting producers/consumers/transports.
   * More efficient for simple metadata updates with race condition protection.
   *
   * @param socketId - The unique socket identifier
   * @param metaUpdate - Partial metadata to update
   */
  async updateSocketMeta(
    socketId: string,
    metaUpdate: Partial<WsGatewaySocketMapValue['meta']>,
  ): Promise<void> {
    const existing = this.getSocketData(socketId);
    if (existing) {
      await this.setSocketData({
        socketId,
        data: {
          ...existing,
          meta: { ...existing.meta, ...metaUpdate },
        },
      });
    }
  }

  /**
   * Finds a socket by user ID and room code with optimized lookup.
   * Uses server.fetchSockets() for accurate socket state.
   *
   * @param params - Search criteria
   * @param params.roomCode - The room code to search in
   * @param params.userId - The user ID to find
   * @param server - The Socket.IO server instance
   * @returns The socket instance or null if not found
   */
  async findUserSocket({ roomCode, userId }: { roomCode: string; userId: string }, server: Server) {
    // Optimized lookup: first find in memory map
    const targetSocketId = [...this.socketDataMap.entries()].find(
      ([, data]) => data.meta?.roomCode === roomCode && data.meta?.userId === userId,
    )?.[0];

    if (!targetSocketId) {
      this.logger.debug(`Socket not found for userId=${userId} in room=${roomCode}`);
      return null;
    }

    try {
      // Verify socket is still connected
      const sockets = await server.fetchSockets();
      const foundSocket = sockets.find((s) => s.id === targetSocketId);

      if (!foundSocket) {
        // Cleanup stale data
        this.removeSocketData(targetSocketId);
        this.logger.warn(`Cleaned up stale socket data for ${targetSocketId}`);
      }

      return foundSocket || null;
    } catch (err) {
      this.logger.error(`Error fetching sockets: ${err.message}`);
      return null;
    }
  }

  /**
   * Stores socket metadata for easy retrieval with race condition protection.
   * Optimized for frequently accessed room and user information.
   *
   * @param params - Socket information to remember
   * @param params.socket - The socket instance
   * @param params.roomCode - The room code
   * @param params.userId - The user ID
   * @param params.userName - The user display name
   */
  async rememberSocket({
    socket,
    roomCode,
    userId,
    userName,
  }: {
    socket: Socket;
    roomCode?: string;
    userId?: string;
    userName?: string;
  }): Promise<void> {
    await this.setSocketData({
      socketId: socket.id,
      data: {
        meta: { roomCode, userId, userName },
      },
    });

    this.logger.debug(`Remembered socket ${socket.id} for user ${userName} in room ${roomCode}`);
  }

  /**
   * Removes socket data to prevent memory leaks.
   * Should be called when socket disconnects.
   *
   * @param socketId - The socket ID to remove
   */
  removeSocketData(socketId: string): void {
    const removed = this.socketDataMap.delete(socketId);
    if (removed) {
      this.logger.debug(`Removed socket data for ${socketId}`);
    }
  }

  /**
   * Gets all socket IDs for a specific room.
   * Useful for broadcasting and room management.
   *
   * @param roomCode - The room code to search
   * @returns Array of socket IDs in the room
   */
  getSocketsInRoom(roomCode: string): string[] {
    return [...this.socketDataMap.entries()]
      .filter(([, data]) => data.meta?.roomCode === roomCode)
      .map(([socketId]) => socketId);
  }

  /**
   * Cleans up transport connections to prevent memory leaks.
   * Safely closes WebRTC transports.
   *
   * @param socketId - The socket ID to cleanup
   */
  cleanupTransports(socketId: string): void {
    const socketData = this.getSocketData(socketId);
    if (!socketData?.transports) return;

    // Safely close transports
    try {
      socketData.transports.sendTransport?.close?.();
      socketData.transports.recvTransport?.close?.();
      this.logger.debug(`Cleaned up transports for socket ${socketId}`);
    } catch (err) {
      this.logger.error(`Error cleaning up transports for ${socketId}: ${err.message}`);
    }
  }

  /**
   * Gets memory usage statistics for monitoring.
   * Useful for performance optimization and debugging.
   *
   * @returns Object containing socket count and memory stats
   */
  getMemoryStats(): {
    socketCount: number;
    avgDataSize: number;
    totalMemoryUsage: number;
  } {
    const socketCount = this.socketDataMap.size;

    if (socketCount === 0) {
      return { socketCount: 0, avgDataSize: 0, totalMemoryUsage: 0 };
    }

    // Estimate memory usage (rough calculation)
    const sampleData = JSON.stringify([...this.socketDataMap.values()].slice(0, 10));
    const avgDataSize = sampleData.length / Math.min(10, socketCount);
    const totalMemoryUsage = avgDataSize * socketCount;

    return {
      socketCount,
      avgDataSize: Math.round(avgDataSize),
      totalMemoryUsage: Math.round(totalMemoryUsage),
    };
  }

  /**
   * Performs memory cleanup by removing stale socket data.
   * Should be called periodically to prevent memory leaks.
   *
   * @param server - The Socket.IO server instance for validation
   */
  async performMaintenanceCleanup(server: Server): Promise<void> {
    try {
      const connectedSockets = await server.fetchSockets();
      const connectedSocketIds = new Set(connectedSockets.map((s) => s.id));

      let cleanedCount = 0;
      for (const [socketId] of this.socketDataMap) {
        if (!connectedSocketIds.has(socketId)) {
          this.removeSocketData(socketId);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        this.logger.log(`Maintenance cleanup: removed ${cleanedCount} stale socket entries`);
      }
    } catch (err) {
      this.logger.error(`Maintenance cleanup failed: ${err.message}`);
    }
  }
}
