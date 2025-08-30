import { Inject, Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { MeetingServiceParticipantStatus } from '@zma-nestjs-monorepo/zma-types';
import { MeetingServiceRoomModel } from '@zma-nestjs-monorepo/zma-types/models/meeting';
import { Server, Socket } from 'socket.io';

import { appConfiguration } from '../../../configuration';
import { RealTimeRoom, WsGatewayRoomMapValue } from '../../../core/models';
import { WsGateWayUsersInRoomOutput } from '../../../core/outputs';
import { AiServiceTranslateLanguageEnum, WSGateWayOutgoingEvent } from '../../../core/types';
import { RedisService } from '../../../services/redis/redis.service';
import { MutexUtil } from '../../../utils';

import { SocketManagerService } from './socket-manager.service';

/**
 * Extended room model with version field for optimistic locking.
 */
type VersionedRoomModel = MeetingServiceRoomModel & { version?: number };

/**
 * Manages room-related operations including room state, Redis persistence,
 * participant management, and room lifecycle.
 *
 * This service handles:
 * - Room data storage and retrieval
 * - Admin management and permissions
 * - Participant status tracking
 * - Redis persistence for room data
 * - Recording state management
 * - Real-time room state for transcription
 */
@Injectable()
export class RoomManagerService {
  private readonly logger = new Logger(RoomManagerService.name);

  /**
   * In-memory map storing room data with optimized access patterns.
   * Automatically initializes room data when accessed.
   */
  private roomDataMap = new Map<string, WsGatewayRoomMapValue>();

  /**
   * Mutex for room initialization to prevent race conditions.
   */
  private roomInitMutex = new Map<string, Promise<WsGatewayRoomMapValue>>();

  /**
   * Mutex for admin assignment operations to prevent race conditions.
   */
  private adminMutex = new Map<string, Promise<void>>();

  private readonly ROOM_TTL: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly socketManager: SocketManagerService,
    @Inject('APP_CONFIG')
    private readonly appConfig: ReturnType<typeof appConfiguration>,
  ) {
    this.ROOM_TTL = this.appConfig.meeting.roomTtl;
  }

  /**
   * Retrieves room data with safe initialization and race condition protection.
   * Uses mutex to prevent race conditions during room creation.
   *
   * @param roomCode - The room code identifier
   * @returns Promise resolving to room data object
   */
  async getRoomDataSafe(roomCode: string): Promise<WsGatewayRoomMapValue> {
    // Check if room already exists
    const existingRoom = this.roomDataMap.get(roomCode);
    if (existingRoom) {
      return existingRoom;
    }

    // Use mutex to ensure atomic initialization
    return MutexUtil.withMutex({
      mutexMap: this.roomInitMutex,
      key: roomCode,
      operation: () => this.initializeRoom(roomCode),
      context: 'RoomManager',
    });
  }

  /**
   * Internal room initialization logic.
   *
   * @param roomCode - The room code to initialize
   * @returns Promise resolving to initialized room data
   */
  private async initializeRoom(roomCode: string): Promise<WsGatewayRoomMapValue> {
    // Double-check pattern to prevent duplicate initialization
    const existingRoom = this.roomDataMap.get(roomCode);
    if (existingRoom) {
      return existingRoom;
    }

    const defaultRoomData: WsGatewayRoomMapValue = {
      adminSocketId: null,
      isRecording: false,
      realtimeState: {
        bufferVN: '',
        targetLang: AiServiceTranslateLanguageEnum.EN,
        clearGen: 0,
      },
    };

    this.roomDataMap.set(roomCode, defaultRoomData);
    this.logger.debug(`Async initialized room data for ${roomCode}`);

    return defaultRoomData;
  }

  /**
   * Gets real-time room state for transcription features.
   *
   * @param roomCode - The room code identifier
   * @returns Real-time room state or null if not found
   */
  async getRoomRealtimeState(roomCode: string): Promise<RealTimeRoom | null> {
    const roomData = await this.getRoomDataSafe(roomCode);
    return roomData ? roomData.realtimeState : null;
  }

  /**
   * Sets room admin with atomic operation to prevent race conditions.
   * Ensures only one admin can be set at a time per room using promise chaining.
   *
   * @param params - Admin setting parameters
   * @param params.roomCode - The room code
   * @param params.socketId - The socket ID to set as admin
   */
  async setRoomAdmin({
    roomCode,
    socketId,
  }: {
    roomCode: string;
    socketId: string;
  }): Promise<void> {
    return MutexUtil.withMutex({
      mutexMap: this.adminMutex,
      key: roomCode,
      operation: () => this.executeAdminAssignment(roomCode, socketId),
      context: 'RoomManager',
    });
  }

  /**
   * Internal admin assignment logic.
   *
   * @param roomCode - The room code
   * @param socketId - The socket ID to set as admin
   */
  private async executeAdminAssignment(roomCode: string, socketId: string): Promise<void> {
    const roomData = await this.getRoomDataSafe(roomCode);
    const previousAdmin = roomData.adminSocketId;

    // Atomic assignment
    roomData.adminSocketId = socketId;
    this.roomDataMap.set(roomCode, roomData);

    this.logger.log(`Room ${roomCode} admin changed: ${previousAdmin} → ${socketId}`);
  }

  /**
   * Gets current room admin socket ID.
   *
   * @param roomCode - The room code
   * @returns Admin socket ID or null if no admin
   */
  async getRoomAdmin(roomCode: string): Promise<string | null> {
    const roomData = await this.getRoomDataSafe(roomCode);
    return roomData.adminSocketId;
  }

  /**
   * Checks if a socket is the room administrator.
   *
   * @param params - Check parameters
   * @param params.socket - The socket to check
   * @param params.roomCode - The room code
   * @returns True if socket is admin, false otherwise
   */
  async isSocketRoomAdmin({
    socket,
    roomCode,
  }: {
    socket: Socket;
    roomCode: string;
  }): Promise<boolean> {
    const adminSocketId = await this.getRoomAdmin(roomCode);
    return adminSocketId === socket.id;
  }

  /**
   * Sets room recording state with logging.
   *
   * @param params - Recording state parameters
   * @param params.roomCode - The room code
   * @param params.isRecording - Recording state to set
   */
  async setRoomRecording({
    roomCode,
    isRecording,
  }: {
    roomCode: string;
    isRecording: boolean;
  }): Promise<void> {
    const roomData = await this.getRoomDataSafe(roomCode);
    roomData.isRecording = isRecording;
    this.roomDataMap.set(roomCode, roomData);

    this.logger.log(`Room ${roomCode} recording state: ${isRecording ? 'ON' : 'OFF'}`);
  }

  /**
   * Checks if room is currently recording.
   *
   * @param roomCode - The room code
   * @returns True if recording, false otherwise
   */
  async isRoomRecording(roomCode: string): Promise<boolean> {
    const roomData = await this.getRoomDataSafe(roomCode);
    return roomData.isRecording;
  }

  /**
   * Removes room admin (sets to null) with atomic operation.
   * Used when admin disconnects. Uses promise chaining for proper serialization.
   *
   * @param roomCode - The room code
   */
  async clearRoomAdmin(roomCode: string): Promise<void> {
    return MutexUtil.withMutex({
      mutexMap: this.adminMutex,
      key: roomCode,
      operation: () => this.executeClearAdmin(roomCode),
      context: 'RoomManager',
    });
  }

  /**
   * Internal admin clearing logic.
   *
   * @param roomCode - The room code
   */
  private async executeClearAdmin(roomCode: string): Promise<void> {
    const roomData = await this.getRoomDataSafe(roomCode);
    const previousAdmin = roomData.adminSocketId;
    roomData.adminSocketId = null;
    this.roomDataMap.set(roomCode, roomData);

    this.logger.log(`Cleared admin for room ${roomCode} (was: ${previousAdmin})`);
  }

  // Redis operations for persistent room data

  /**
   * Retrieves room data from Redis with error handling.
   *
   * @param roomCode - The room code
   * @returns Room data from Redis or null if not found
   */
  async getRoomFromRedis(roomCode: string): Promise<MeetingServiceRoomModel | null> {
    try {
      const key = `meeting:code:${roomCode}`;
      const roomData = await this.redisService.get<MeetingServiceRoomModel>(key);
      return roomData;
    } catch (err) {
      this.logger.error(`Failed to get room ${roomCode} from Redis: ${err.message}`);
      return null;
    }
  }

  /**
   * Gets the current status of a user in a room.
   *
   * @param params - User status check parameters
   * @param params.roomCode - The room code
   * @param params.userId - The user ID
   * @returns User status if found, null if user not in room
   */
  async getUserStatusInRoom({
    roomCode,
    userId,
  }: {
    roomCode: string;
    userId: string;
  }): Promise<MeetingServiceParticipantStatus | null> {
    try {
      const roomData = await this.getRoomFromRedis(roomCode);

      if (roomData) {
        const participant = roomData.participants.find((p) => p.userId === userId);
        return participant ? participant.status : null;
      }

      return null;
    } catch (err) {
      this.logger.error(`Failed to get user status in room ${roomCode}: ${err.message}`);
      return null;
    }
  }

  /**
   * Broadcasts users in room to all participants.
   * Includes admin information and socket details.
   *
   * @param params - Broadcast parameters
   * @param params.roomCode - The room code
   * @param params.connectedSocketIds - Array of connected socket IDs
   * @param server - The Socket.IO server instance
   */
  async broadcastUsersInRoom({
    roomCode,
    connectedSocketIds,
    server,
  }: {
    roomCode: string;
    connectedSocketIds: string[];
    server: Server;
  }): Promise<void> {
    const adminSocketId = await this.getRoomAdmin(roomCode);

    const message: WsGateWayUsersInRoomOutput = {
      users: connectedSocketIds.map((id) => ({
        id,
        name: this.socketManager.getSocketData(id)?.meta?.userName || 'Ẩn danh',
      })),
      adminSocketId,
    };

    server.to(roomCode).emit(WSGateWayOutgoingEvent.UsersInRoom, message);
    this.logger.debug(`Broadcasted ${connectedSocketIds.length} users in room ${roomCode}`);
  }

  /**
   * Cleans up room data when empty.
   * Removes room from memory to prevent memory leaks.
   *
   * @param roomCode - The room code
   * @param server - The Socket.IO server instance
   */
  async cleanupEmptyRoom(roomCode: string, server: Server): Promise<void> {
    try {
      const socketsInRoom = await server.in(roomCode).fetchSockets();

      if (socketsInRoom.length === 0) {
        this.roomDataMap.delete(roomCode);
        this.logger.log(`Cleaned up empty room: ${roomCode}`);
      }
    } catch (err) {
      this.logger.error(`Failed to cleanup room ${roomCode}: ${err.message}`);
    }
  }

  /**
   * Gets memory usage statistics for room data.
   *
   * @returns Object containing room count and memory stats
   */
  getMemoryStats(): {
    roomCount: number;
    avgDataSize: number;
    totalMemoryUsage: number;
  } {
    const roomCount = this.roomDataMap.size;

    if (roomCount === 0) {
      return { roomCount: 0, avgDataSize: 0, totalMemoryUsage: 0 };
    }

    // Estimate memory usage
    const sampleData = JSON.stringify([...this.roomDataMap.values()].slice(0, 5));
    const avgDataSize = sampleData.length / Math.min(5, roomCount);
    const totalMemoryUsage = avgDataSize * roomCount;

    return {
      roomCount,
      avgDataSize: Math.round(avgDataSize),
      totalMemoryUsage: Math.round(totalMemoryUsage),
    };
  }

  /**
   * Performs maintenance cleanup for stale rooms.
   * Should be called periodically to prevent memory leaks.
   *
   * @param server - The Socket.IO server instance
   */
  async performMaintenanceCleanup(server: Server): Promise<void> {
    const roomCodes = [...this.roomDataMap.keys()];
    let cleanedCount = 0;

    for (const roomCode of roomCodes) {
      try {
        const socketsInRoom = await server.in(roomCode).fetchSockets();
        if (socketsInRoom.length === 0) {
          this.roomDataMap.delete(roomCode);
          cleanedCount++;
        }
      } catch (err) {
        this.logger.error(`Error during maintenance cleanup for room ${roomCode}: ${err.message}`);
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Maintenance cleanup: removed ${cleanedCount} empty rooms`);
    }
  }

  // ===== OPTIMISTIC LOCKING METHODS =====

  /**
   * Updates user status in room with optimistic locking to prevent race conditions.
   * Retries on version conflicts to ensure data consistency.
   *
   * @param params - Status update parameters
   * @param params.roomCode - The room code
   * @param params.userId - The user ID
   * @param params.status - New participant status
   * @param params.maxRetries - Maximum number of retry attempts (default: 3)
   * @throws Error if all retries are exhausted or room not found
   */
  async setUserStatusWithLock({
    roomCode,
    userId,
    status,
    maxRetries = 3,
  }: {
    roomCode: string;
    userId: string;
    status: MeetingServiceParticipantStatus;
    maxRetries?: number;
  }): Promise<void> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const roomData = (await this.getRoomFromRedis(roomCode)) as VersionedRoomModel;

        if (!roomData) {
          throw new WsException(`Room ${roomCode} not found`);
        }

        // Find participant
        const participant = roomData.participants.find((p) => p.userId === userId);
        if (!participant) {
          throw new WsException(`User ${userId} not found in room ${roomCode} participants`);
        }

        // Store old status for logging
        const oldStatus = participant.status;

        // Update status and increment version
        participant.status = status;
        const currentVersion = roomData.version || 0;
        roomData.version = currentVersion + 1;

        // Attempt atomic update with version check
        const success = await this.atomicUpdateRoom(roomCode, roomData, currentVersion);

        if (success) {
          this.logger.log(
            `Updated user ${userId} status in room ${roomCode}: ${oldStatus} → ${status} (version: ${roomData.version})`,
          );
          return;
        }

        // Version conflict - retry with exponential backoff
        if (attempt < maxRetries - 1) {
          const backoffMs = 50 * Math.pow(2, attempt);
          this.logger.debug(
            `Version conflict updating user ${userId} in room ${roomCode}, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      } catch (err) {
        if (attempt === maxRetries - 1) {
          this.logger.error(
            `Failed to update user status after ${maxRetries} attempts: ${err.message}`,
          );
          throw err;
        }
        // Continue retrying for recoverable errors
      }
    }

    throw new WsException(
      `Failed to update user ${userId} status in room ${roomCode} after ${maxRetries} retries`,
    );
  }

  /**
   * Processes user join request with optimistic locking to prevent race conditions.
   * Handles concurrent join requests safely.
   *
   * @param params - User join request parameters
   * @param params.roomCode - The room code
   * @param params.userId - The user ID
   * @param params.userName - The user display name
   * @param params.maxRetries - Maximum number of retry attempts (default: 3)
   */
  async processUserJoinRequestWithLock({
    roomCode,
    userId,
    userName,
    maxRetries = 3,
  }: {
    roomCode: string;
    userId: string;
    userName: string;
    maxRetries?: number;
  }): Promise<void> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const roomData = (await this.getRoomFromRedis(roomCode)) as VersionedRoomModel;

        if (!roomData) {
          throw new WsException(`Room ${roomCode} not found`);
        }

        // Check if user already exists
        const existingUser = roomData.participants.find((p) => p.userId === userId);
        const currentVersion = roomData.version || 0;

        if (!existingUser) {
          // Add new user as pending
          roomData.participants.push({
            userId,
            userName,
            status: MeetingServiceParticipantStatus.Pending,
            joinedAt: new Date(),
          });
          this.logger.log(`Added new pending user ${userName} to room ${roomCode}`);
        } else {
          // Handle existing user based on previous status
          switch (existingUser.status) {
            case MeetingServiceParticipantStatus.Approved:
            case MeetingServiceParticipantStatus.Left:
              // Auto-approve returning approved/left users
              existingUser.status = MeetingServiceParticipantStatus.Approved;
              existingUser.joinedAt = new Date();
              this.logger.log(`Auto-approved returning user ${userName} in room ${roomCode}`);
              break;
            case MeetingServiceParticipantStatus.Pending:
              // Update join timestamp for pending users
              existingUser.joinedAt = new Date();
              this.logger.log(`Updated pending user ${userName} timestamp in room ${roomCode}`);
              break;
            case MeetingServiceParticipantStatus.Rejected:
              // Rejected users remain rejected
              this.logger.warn(`Rejected user ${userName} attempted to rejoin room ${roomCode}`);
              return;
          }
        }

        // Increment version and attempt atomic update
        roomData.version = currentVersion + 1;
        const success = await this.atomicUpdateRoom(roomCode, roomData, currentVersion);

        if (success) {
          return;
        }

        // Version conflict - retry with exponential backoff
        if (attempt < maxRetries - 1) {
          const backoffMs = 50 * Math.pow(2, attempt);
          this.logger.debug(
            `Version conflict processing join for user ${userId} in room ${roomCode}, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      } catch (err) {
        if (attempt === maxRetries - 1) {
          this.logger.error(
            `Failed to process user join request after ${maxRetries} attempts: ${err.message}`,
          );
          throw err;
        }
      }
    }

    throw new WsException(
      `Failed to process join request for user ${userId} in room ${roomCode} after ${maxRetries} retries`,
    );
  }

  /**
   * Sets admin online status with optimistic locking.
   *
   * @param params - Admin status parameters
   * @param params.roomCode - The room code
   * @param params.isOnline - Online status to set
   * @param params.maxRetries - Maximum number of retry attempts (default: 3)
   */
  async setAdminOnlineWithLock({
    roomCode,
    isOnline,
    maxRetries = 3,
  }: {
    roomCode: string;
    isOnline: boolean;
    maxRetries?: number;
  }): Promise<void> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const roomData = (await this.getRoomFromRedis(roomCode)) as VersionedRoomModel;

        if (!roomData) {
          this.logger.warn(`Room ${roomCode} not found when setting admin online status`);
          return;
        }

        const currentVersion = roomData.version || 0;
        roomData.isAdminOnline = isOnline;
        roomData.version = currentVersion + 1;

        const success = await this.atomicUpdateRoom(roomCode, roomData, currentVersion);

        if (success) {
          this.logger.debug(
            `Set admin online status for room ${roomCode}: ${isOnline} (version: ${roomData.version})`,
          );
          return;
        }

        // Version conflict - retry
        if (attempt < maxRetries - 1) {
          const backoffMs = 50 * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      } catch (err) {
        if (attempt === maxRetries - 1) {
          this.logger.error(
            `Failed to set admin online status after ${maxRetries} attempts: ${err.message}`,
          );
          throw err;
        }
      }
    }

    throw new WsException(
      `Failed to set admin online status for room ${roomCode} after ${maxRetries} retries`,
    );
  }

  /**
   * Performs atomic room update with version checking using Redis Lua script.
   * Uses Lua script to ensure true atomicity and prevent race conditions.
   *
   * @param roomCode - The room code
   * @param roomData - The updated room data
   * @param expectedVersion - The expected current version
   * @returns True if update succeeded, false if version conflict
   */
  private async atomicUpdateRoom(
    roomCode: string,
    roomData: VersionedRoomModel,
    expectedVersion: number,
  ): Promise<boolean> {
    try {
      const key = `meeting:code:${roomCode}`;
      const versionKey = `meeting:version:${roomCode}`;

      // Lua script for true atomic operation
      const script = `
        local key = KEYS[1]
        local versionKey = KEYS[2]
        local expectedVersion = tonumber(ARGV[1])
        local newData = ARGV[2]
        local newVersion = ARGV[3]
        local ttl = tonumber(ARGV[4])

        -- Get current version (default to 0 if not exists)
        local currentVersion = redis.call('GET', versionKey)
        if currentVersion == false then
          currentVersion = 0
        else
          currentVersion = tonumber(currentVersion)
        end

        -- Check version match
        if currentVersion ~= expectedVersion then
          return 0  -- Version conflict
        end

        -- Atomically update both room data and version
        redis.call('SETEX', key, ttl, newData)
        redis.call('SETEX', versionKey, ttl, newVersion)
        return 1  -- Success
      `;

      const result = await this.redisService.eval({
        script,
        keys: [key, versionKey],
        args: [
          expectedVersion.toString(),
          JSON.stringify(roomData),
          (roomData.version || 0).toString(),
          this.ROOM_TTL.toString(),
        ],
      });

      const success = result === 1;

      if (success) {
        this.logger.debug(
          `Atomic update succeeded for room ${roomCode}: version ${expectedVersion} → ${roomData.version}`,
        );
      } else {
        this.logger.debug(`Version conflict for room ${roomCode}: expected ${expectedVersion}`);
      }

      return success;
    } catch (err) {
      this.logger.error(`Atomic update failed for room ${roomCode}: ${err.message}`);
      return false;
    }
  }
}
