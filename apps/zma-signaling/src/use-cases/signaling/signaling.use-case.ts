import { Injectable, Logger } from '@nestjs/common';
import { WebSocketServer, WsException } from '@nestjs/websockets';
import { AiServiceTranslateLanguageEnum, MeetingServiceParticipantStatus } from '@zma-nestjs-monorepo/zma-types';
import { MeetingServiceRoomModel } from '@zma-nestjs-monorepo/zma-types/models/meeting';
import { OpenAiService } from '@zma-nestjs-monorepo/zma-utils';
import { types } from 'mediasoup';
import { Server, Socket } from 'socket.io';

import {
  WsGateWayApproveUserInput,
  WsGateWayConnectRecvTransportInput,
  WsGateWayConnectTransportInput,
  WsGateWayConsumeInput,
  WsGateWayHandleMessageInput,
  WsGateWayJoinInput,
  WsGateWayKickInput,
  WsGateWayProduceInput,
  WsGateWayRejectUserInput,
  WSGateWayRequestJoinInput,
  WsGatewayRoomUserInput,
  WsGateWayStartRecordingInput,
  WsGateWayTranscriptInput,
} from '../../core/inputs';
import {
  WsGateWayConnectRecvTransportOutput,
  WsGateWayConnectTransportOutput,
  WsGateWayConsumeOutput,
  WsGateWayHandleCreateTransportOutput,
  WsGateWayProduceOutput,
  WsGateWayUserOutput
} from '../../core/outputs';
import { WSGateWayOutgoingEvent } from '../../core/types';

import { MediasoupManagerService } from './managers/mediasoup-manager.service';
import { RoomManagerService } from './managers/room-manager.service';
import { SocketManagerService } from './managers/socket-manager.service';
import { TranscriptManagerService } from './managers/transcript-manager.service';
import { UserMutexService } from './managers/user-mutex.service';

@Injectable()
export class SignalingUseCase {
  private readonly logger = new Logger(SignalingUseCase.name);

  @WebSocketServer() server: Server;

  constructor(
    private readonly aiService: OpenAiService,
    private readonly socketManager: SocketManagerService,
    private readonly roomManager: RoomManagerService,
    private readonly mediasoupManager: MediasoupManagerService,
    private readonly transcriptManager: TranscriptManagerService,
    private readonly userMutex: UserMutexService,
  ) {
    this.logger.log('🚀 SignalingUseCase initialized');
  }

  /**
   * Handles ping requests with simple response.
   * Used for connection health checks.
   */
  async handlePing(socket: Socket): Promise<{ pong: boolean }> {
    const translatedText = await this.aiService.translateText({ text: 'Hello, world!', targetLanguage: AiServiceTranslateLanguageEnum.VI });
    this.logger.debug(`Translated text: ${translatedText}`);
    this.logger.debug(`Ping from ${socket.id}`);
    return { pong: true };
  }

  // ===== USER JOIN FLOW =====

  /**
   * Handles user request to join a room.
   * Manages admin promotion, pending user flow, and approval requests.
   * Users with approved status can join directly without re-approval.
   */
  async handleRequestJoin(
    input: WsGateWayHandleMessageInput<WSGateWayRequestJoinInput>,
  ): Promise<void> {
    const { socket, data, userId } = input;
    const { roomCode, userName } = data;

    try {
      // Validate room existence
      const roomData = await this.roomManager.getRoomFromRedis(roomCode);
      if (!roomData) {
        socket.emit(WSGateWayOutgoingEvent.JoinError, 'Phòng không tồn tại');
        this.logger.warn(`Room ${roomCode} not found for user ${userName}`);
        return;
      }

      // Check if user was rejected (do this first to prevent access)
      const initialStatus = await this.roomManager.getUserStatusInRoom({ roomCode, userId });
      if (initialStatus === MeetingServiceParticipantStatus.Rejected) {
        socket.emit(WSGateWayOutgoingEvent.RejectedToJoin);
        this.logger.warn(`Rejected user ${userName} attempted to join room ${roomCode}`);
        return;
      }

      // Add/update user in room (handles status transitions intelligently)
      await this.processUserJoinRequest({ socket, roomData, userId, userName });

      // Check user status after processing to see if they can join directly
      const currentStatus = await this.roomManager.getUserStatusInRoom({ roomCode, userId });

      // If user is approved (either was already approved or became approved), let them join directly
      if (currentStatus === MeetingServiceParticipantStatus.Approved) {
        this.logger.log(`User ${userName} has approved status, joining directly`);
        socket.emit(WSGateWayOutgoingEvent.ApprovedToJoin);
        return;
      }

      // Try admin promotion if admin is offline
      if (!roomData.isAdminOnline) {
        const promoted = await this.grantAdminPrivilegesIfEligible({
          socket,
          roomData,
          userId,
          userName,
        });
        if (promoted) return;
      }

      // Notify admin if online (only for users who are still pending after processing)
      if (roomData.isAdminOnline && currentStatus === MeetingServiceParticipantStatus.Pending) {
        await this.notifyAdminForApproval({ socket, roomData, userId, userName });
      }

      // Notify user of waiting status
      socket.emit(WSGateWayOutgoingEvent.WaitingApproval);

      this.logger.log(`User ${userName} requested to join room ${roomCode}`);
    } catch (err) {
      this.logger.error(`Failed to handle request join: ${err.message}`);
      socket.emit(WSGateWayOutgoingEvent.JoinError, 'Lỗi hệ thống, vui lòng thử lại');
    }
  }

  /**
   * Handles user joining a room after approval.
   * Manages room state, user synchronization, and media setup with comprehensive validation.
   * Uses user-level mutex to prevent race conditions during concurrent join operations.
   */
  async handleJoin(input: WsGateWayHandleMessageInput<WsGateWayJoinInput>): Promise<void> {
    const { userId } = input;

    // Use user-level mutex to prevent race conditions
    return this.userMutex.withUserLock({
      userId,
      operation: async () => {
        return this.executeJoinOperation(input);
      },
    });
  }

  /**
   * Executes the actual join operation with race condition protection.
   * This method contains the core join logic that runs under mutex protection.
   */
  private async executeJoinOperation(
    input: WsGateWayHandleMessageInput<WsGateWayJoinInput>,
  ): Promise<void> {
    const { socket, data, userId } = input;
    const { roomCode, userName } = data;
    let hasJoinedRoom = false;
    let hasStoredSocket = false;

    try {
      // Validate room existence
      const roomData = await this.roomManager.getRoomFromRedis(roomCode);
      if (!roomData) {
        socket.emit(WSGateWayOutgoingEvent.JoinError, 'Phòng không tồn tại');
        this.logger.warn(`Room ${roomCode} not found for user ${userName}`);
        return;
      }

      // Check user status with specific feedback
      const currentStatus = await this.roomManager.getUserStatusInRoom({ roomCode, userId });

      if (currentStatus !== MeetingServiceParticipantStatus.Approved) {
        this.handleUnapprovedJoinAttempt({ socket, status: currentStatus, userName, roomCode });
        return;
      }

      // Handle duplicate connections
      await this.handleDuplicateConnections({ roomCode, userId, userName, currentSocket: socket });

      // Restore admin rights first (if applicable) to ensure proper permissions
      const isAdmin = await this.restoreAdminIfNeeded({ socket, roomData, userId, userName });

      // Join socket.io room
      socket.join(roomCode);
      hasJoinedRoom = true;

      // Store socket metadata
      await this.socketManager.rememberSocket({ socket, roomCode, userId, userName });
      hasStoredSocket = true;

      // Execute post-join operations
      await this.executePostJoinOperations({
        socket,
        roomCode,
        userName,
        isAdmin,
        roomData,
      });

      this.logger.log(`✅ User ${userName} joined room ${roomCode}${isAdmin ? ' as admin' : ''}`);
    } catch (err) {
      this.logger.error(
        `Failed to handle join for user ${userName} in room ${roomCode}: ${err.message}`,
        {
          stack: err.stack,
          userId,
          roomCode,
        },
      );

      // Cleanup on failure
      await this.cleanupFailedJoin({
        socket,
        roomCode,
        hasJoinedRoom,
        hasStoredSocket,
      });

      socket.emit(WSGateWayOutgoingEvent.JoinError, 'Lỗi khi tham gia phòng');
    }
  }

  // ===== USER MANAGEMENT =====

  /**
   * Handles admin approval of pending user.
   * Updates user status and allows them to join.
   */
  async handleApproveUser(
    input: WsGateWayHandleMessageInput<WsGateWayApproveUserInput>,
  ): Promise<void> {
    const { socket, data } = input;
    const { userId } = data;

    try {
      const socketData = this.socketManager.getSocketData(socket.id);
      const roomCode = socketData?.meta?.roomCode;

      if (!socketData || !roomCode) return;

      // Verify admin permissions
      if (!(await this.roomManager.isSocketRoomAdmin({ socket, roomCode }))) {
        this.logger.warn(`Non-admin ${socket.id} attempted to approve user`);
        return;
      }

      // Find target user socket
      const userSocket = await this.socketManager.findUserSocket({ roomCode, userId }, this.server);
      if (!userSocket) {
        this.logger.warn(`Cannot find socket for user ${userId} in room ${roomCode}`);
        return;
      }

      // Update user status in Redis with optimistic locking
      await this.roomManager.setUserStatusWithLock({
        roomCode,
        userId,
        status: MeetingServiceParticipantStatus.Approved,
      });

      // Notify user of approval
      const approvedUser: WsGateWayUserOutput = { userId, userName: userSocket.data.userName };
      userSocket.emit(WSGateWayOutgoingEvent.ApprovedToJoin, approvedUser);

      this.logger.log(`Admin approved user ${userId} for room ${roomCode}`);
    } catch (err) {
      this.logger.error(`Failed to approve user: ${err.message}`);
    }
  }

  /**
   * Handles admin rejection of pending user.
   * Updates status and disconnects user.
   */
  async handleRejectUser(
    input: WsGateWayHandleMessageInput<WsGateWayRejectUserInput>,
  ): Promise<void> {
    const { socket, data } = input;
    const { userId } = data;

    try {
      const socketData = this.socketManager.getSocketData(socket.id);
      const roomCode = socketData?.meta?.roomCode;

      if (!socketData || !roomCode) return;

      // Verify admin permissions
      if (!(await this.roomManager.isSocketRoomAdmin({ socket, roomCode }))) return;

      // Find and disconnect user
      const userSocket = await this.socketManager.findUserSocket({ roomCode, userId }, this.server);
      if (!userSocket) {
        this.logger.warn(`Cannot find socket for user ${userId} in room ${roomCode}`);
        return;
      }

      // Update status and disconnect with optimistic locking
      await this.roomManager.setUserStatusWithLock({
        roomCode,
        userId,
        status: MeetingServiceParticipantStatus.Rejected,
      });

      userSocket.emit(WSGateWayOutgoingEvent.RejectedToJoin);
      userSocket.disconnect(true);

      this.logger.log(`Admin rejected user ${userId} from room ${roomCode}`);
    } catch (err) {
      this.logger.error(`Failed to reject user: ${err.message}`);
    }
  }

  /**
   * Handles admin request for pending users list.
   *
   * @param socket - Admin socket requesting list
   */
  async handleGetPendingUsers(socket: Socket): Promise<void> {
    try {
      const socketData = this.socketManager.getSocketData(socket.id);
      const roomCode = socketData?.meta?.roomCode;

      if (!socketData || !roomCode) return;

      const roomData = await this.roomManager.getRoomFromRedis(roomCode);
      if (!roomData) {
        socket.emit(WSGateWayOutgoingEvent.JoinError, 'Phòng không tồn tại');
        return;
      }

      const pendingUsers = roomData.participants.filter(
        (p) => p.status === MeetingServiceParticipantStatus.Pending,
      );

      socket.emit(WSGateWayOutgoingEvent.PendingUsers, { pendingUsers });
    } catch (err) {
      this.logger.error(`Failed to get pending users: ${err.message}`);
    }
  }

  /**
   * Handles admin kicking a user from room.
   */
  async handleKick(input: WsGateWayHandleMessageInput<WsGateWayKickInput>): Promise<void> {
    const { socket, data } = input;
    const { userId } = data;

    try {
      const socketData = this.socketManager.getSocketData(socket.id);
      const roomCode = socketData?.meta?.roomCode;

      if (!socketData || !roomCode) return;

      // Verify admin permissions
      if (!(await this.roomManager.isSocketRoomAdmin({ socket, roomCode }))) return;

      // Find and disconnect user
      const userSocket = await this.socketManager.findUserSocket({ roomCode, userId }, this.server);
      if (!userSocket) {
        this.logger.warn(`Cannot find socket for user ${userId} in room ${roomCode}`);
        return;
      }

      userSocket.emit(WSGateWayOutgoingEvent.Kicked);
      userSocket.leave(roomCode);
      userSocket.disconnect();

      // Update room user list
      const connectedSocketIds = (await this.server.in(roomCode).fetchSockets()).map((s) => s.id);
      await this.roomManager.broadcastUsersInRoom({
        roomCode,
        connectedSocketIds,
        server: this.server,
      });

      this.server.to(roomCode).emit(WSGateWayOutgoingEvent.UserLeft, { userId });

      this.logger.log(`User ${userId} kicked from room ${roomCode}`);
    } catch (err) {
      this.logger.error(`Failed to kick user: ${err.message}`);
    }
  }

  // ===== MEDIASOUP WEBRTC OPERATIONS =====

  /**
   * Gets RTP capabilities for WebRTC setup.
   * Only approved users can access RTP capabilities.
   *
   * @param input - Request parameters
   * @param input.userId - The requesting user ID
   * @param input.socketId - The socket ID for validation
   * @returns RTP capabilities from mediasoup router
   */
  async handleGetRtpCapabilities(input: {
    userId: string;
    socketId: string;
  }): Promise<types.RtpCapabilities> {
    // Validate user is approved in their current room
    await this.validateUserApproved({ userId: input.userId, socketId: input.socketId });
    return this.mediasoupManager.getRtpCapabilities();
  }

  /**
   * Creates WebRTC transports for a socket.
   * Only approved users can create transports.
   *
   * @param input - Transport creation parameters
   * @param input.socket - Socket requesting transport creation
   * @param input.userId - The requesting user ID
   * @returns Transport parameters for client setup
   */
  async handleCreateTransport(input: {
    socket: Socket;
    userId: string;
  }): Promise<WsGateWayHandleCreateTransportOutput> {
    // Validate user is approved in their current room
    await this.validateUserApproved({ userId: input.userId, socketId: input.socket.id });
    return this.mediasoupManager.createTransport(input.socket);
  }

  /**
   * Connects send transport with DTLS parameters.
   * Only approved users can connect transports.
   *
   * @param input - Connection parameters with user ID
   * @returns Connection result
   */
  async handleConnectTransport(
    input: WsGateWayHandleMessageInput<WsGateWayConnectTransportInput>,
  ): Promise<WsGateWayConnectTransportOutput> {
    // Validate user is approved in their current room
    await this.validateUserApproved({ userId: input.userId, socketId: input.socket.id });
    return this.mediasoupManager.connectTransport(input);
  }

  /**
   * Connects receive transport with DTLS parameters.
   * Only approved users can connect transports.
   *
   * @param input - Connection parameters with user ID
   * @returns Connection result
   */
  async handleConnectRecvTransport(
    input: WsGateWayHandleMessageInput<WsGateWayConnectRecvTransportInput>,
  ): Promise<WsGateWayConnectRecvTransportOutput> {
    // Validate user is approved in their current room
    await this.validateUserApproved({ userId: input.userId, socketId: input.socket.id });
    return this.mediasoupManager.connectRecvTransport(input);
  }

  /**
   * Creates media producer for streaming.
   * Only approved users can produce media.
   *
   * @param input - Producer creation parameters with user ID
   * @returns Producer creation result
   */
  async handleProduce(
    input: WsGateWayHandleMessageInput<WsGateWayProduceInput>,
  ): Promise<WsGateWayProduceOutput> {
    // Validate user is approved in their current room
    await this.validateUserApproved({ userId: input.userId, socketId: input.socket.id });

    const socketData = this.socketManager.getSocketData(input.socket.id);
    const roomCode = socketData?.meta?.roomCode;

    return this.mediasoupManager.produce({
      ...input,
      roomCode,
      server: this.server,
    });
  }

  /**
   * Creates media consumer for receiving streams.
   * Only approved users can consume media.
   *
   * @param input - Consumer creation parameters with user ID
   * @returns Consumer creation result
   */
  async handleConsume(
    input: WsGateWayHandleMessageInput<WsGateWayConsumeInput>,
  ): Promise<WsGateWayConsumeOutput> {
    // Validate user is approved in their current room
    await this.validateUserApproved({ userId: input.userId, socketId: input.socket.id });
    return this.mediasoupManager.consume(input);
  }

  // ===== TRANSCRIPT AND RECORDING =====

  /**
   * Handles real-time transcript processing.
   * Only approved users can process transcripts.
   *
   * @param input - Transcript parameters with user ID
   */
  async handleTranscript(
    input: WsGateWayHandleMessageInput<WsGateWayTranscriptInput>,
  ): Promise<void> {
    // Validate user is approved in their current room
    await this.validateUserApproved({ userId: input.userId, socketId: input.socket.id });

    return this.transcriptManager.handleTranscript({
      ...input,
      server: this.server,
    });
  }

  /**
   * Handles stopping transcript processing.
   * Only approved users can stop transcripts.
   *
   * @param input - Stop transcript parameters
   * @param input.socket - Socket stopping transcript
   * @param input.userId - The requesting user ID
   */
  async handleStopTranscript(input: { socket: Socket; userId: string }): Promise<void> {
    // Validate user is approved in their current room
    await this.validateUserApproved({ userId: input.userId, socketId: input.socket.id });
    return this.transcriptManager.handleStopTranscript(input.socket);
  }

  /**
   * Starts recording session with language settings.
   * Only approved users can start recording.
   *
   * @param input - Recording start parameters with user ID
   */
  async handleStartRecording(
    input: WsGateWayHandleMessageInput<WsGateWayStartRecordingInput>,
  ): Promise<void> {
    // Validate user is approved in their current room
    await this.validateUserApproved({ userId: input.userId, socketId: input.socket.id });

    const { socket, data } = input;
    const { targetLang, sourceLang } = data;

    return this.transcriptManager.startRecording({
      targetLang,
      sourceLang,
      socket,
    });
  }

  /**
   * Stops recording session.
   * Only approved users can stop recording.
   *
   * @param input - Stop recording parameters
   * @param input.socket - Socket stopping recording
   * @param input.userId - The requesting user ID
   */
  async handleStopRecording(input: { socket: Socket; userId: string }): Promise<void> {
    // Validate user is approved in their current room
    await this.validateUserApproved({ userId: input.userId, socketId: input.socket.id });
    return this.transcriptManager.stopRecording(input.socket);
  }

  // ===== CONNECTION LIFECYCLE =====

  /**
   * Handles socket disconnection with comprehensive cleanup.
   * Optimized for memory efficiency and resource management.
   *
   * @param socket - Disconnecting socket
   */
  async handleLeave(socket: Socket): Promise<void> {
    const socketId = socket.id;
    const socketData = this.socketManager.getSocketData(socketId);
    const userId = socketData?.meta?.userId;
    const roomCode = socketData?.meta?.roomCode;

    this.logger.log(`🔌 Starting cleanup for socket ${socketId}, user: ${userId || 'N/A'}`);

    try {
      // Room cleanup if user was in a room
      if (roomCode && userId) {
        await this.cleanupRoomPresence({ roomCode, userId, socket });
      }

      // Resource cleanup operations in parallel for efficiency
      await Promise.allSettled([
        this.safeExecute({
          fn: () => this.socketManager.cleanupTransports(socketId),
          label: 'Socket transports',
        }),
        this.safeExecute({
          fn: () => this.mediasoupManager.cleanupMediasoupResources(socketId),
          label: 'Mediasoup resources',
        }),
        this.safeExecute({ fn: () => this.cleanupFFmpeg(socket), label: 'FFmpeg processes' }),
      ]);

      // Final socket data cleanup
      this.socketManager.removeSocketData(socketId);

      this.logger.log(`✅ Cleanup completed for socket ${socketId}`);
    } catch (err) {
      this.logger.error(`❌ Cleanup failed for socket ${socketId}: ${err.message}`);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Attempts to promote user to admin if they're the room owner.
   *
   * @param input - User and room information
   * @returns True if promoted to admin, false otherwise
   */
  private async grantAdminPrivilegesIfEligible(input: WsGatewayRoomUserInput): Promise<boolean> {
    const { socket, roomData, userId, userName } = input;

    // Check if user is the designated admin
    if (userId !== roomData.adminId) return false;

    try {
      const roomCode = roomData.code;
      // Set as room admin
      await this.roomManager.setRoomAdmin({ roomCode, socketId: socket.id });
      await this.roomManager.setAdminOnlineWithLock({ roomCode, isOnline: true });

      // Update user status in Redis with optimistic locking
      await this.roomManager.setUserStatusWithLock({
        roomCode,
        userId,
        status: MeetingServiceParticipantStatus.Approved,
      });

      // Store socket metadata
      await this.socketManager.rememberSocket({
        socket,
        roomCode,
        userId,
        userName,
      });

      // Notify user and handle join flow
      socket.emit(WSGateWayOutgoingEvent.YouAreAdmin);
      // await this.handleJoin({ socket, data: { roomCode, userName }, userId });
      socket.emit(WSGateWayOutgoingEvent.ApprovedToJoin);

      // Send pending users list
      const updatedRoomData = await this.roomManager.getRoomFromRedis(roomCode);
      const pendingUsers = updatedRoomData.participants.filter(
        (p) => p.status === MeetingServiceParticipantStatus.Pending,
      );
      socket.emit(WSGateWayOutgoingEvent.PendingUsers, { pendingUsers });

      this.logger.log(`🔑 Promoted ${userName} to admin for room ${roomCode}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to promote user to admin: ${err.message}`);
      return false;
    }
  }

  /**
   * Processes user join request with intelligent status management and socket registration.
   *
   * This method handles the complete user onboarding flow:
   * - Registers socket metadata for the user session
   * - Processes join request through room manager with smart status handling
   * - Manages status transitions for returning users automatically
   *
   * The room manager will handle different user scenarios:
   * - New users: Added as PENDING status
   * - Previously approved users: Restored to APPROVED status
   * - Users who left: Auto-approved for seamless rejoin
   * - Rejected users: Blocked from rejoining
   * - Pending users: Updates join timestamp
   *
   * @param input - User join request parameters
   */
  private async processUserJoinRequest(input: WsGatewayRoomUserInput): Promise<void> {
    const { socket, roomData, userId, userName } = input;

    // Register socket metadata for session management
    await this.socketManager.rememberSocket({
      socket,
      roomCode: roomData?.code,
      userId,
      userName,
    });

    // Process join request with optimistic locking to prevent race conditions
    await this.roomManager.processUserJoinRequestWithLock({
      roomCode: roomData?.code || '',
      userId,
      userName,
    });
  }

  /**
   * Notifies admin of pending approval request.
   *
   * @param input - User and room information
   */
  private async notifyAdminForApproval(input: WsGatewayRoomUserInput): Promise<void> {
    const { roomData, userId, userName } = input;

    try {
      const adminSocketId = await this.roomManager.getRoomAdmin(roomData.code);
      if (!adminSocketId) {
        this.logger.warn(`No admin found for room ${roomData.code}`);
        return;
      }

      const sockets = await this.server.fetchSockets();
      const adminSocket = sockets.find((s) => s.id === adminSocketId);

      if (adminSocket) {
        const userOutput: WsGateWayUserOutput = { userId, userName };
        adminSocket.emit(WSGateWayOutgoingEvent.ApproveRequest, userOutput);
        this.logger.log(
          `📋 Notified admin of approval request: ${userName} → room ${roomData.code}`,
        );
      } else {
        this.logger.error(`Admin socket ${adminSocketId} not found`);
      }
    } catch (err) {
      this.logger.error(`Failed to notify admin: ${err.message}`);
    }
  }

  /**
   * Restores admin rights if user was previously admin.
   *
   * @param input - User and room information
   * @returns True if user was restored as admin, false otherwise
   */
  private async restoreAdminIfNeeded(input: WsGatewayRoomUserInput): Promise<boolean> {
    const { roomData, userId, userName, socket } = input;

    if (roomData.adminId !== userId) return false;

    try {
      await this.roomManager.setRoomAdmin({ roomCode: roomData.code, socketId: socket.id });
      await this.roomManager.setAdminOnlineWithLock({ roomCode: roomData.code, isOnline: true });

      socket.emit(WSGateWayOutgoingEvent.YouAreAdmin);
      this.logger.log(`🔄 Restored admin rights for ${userName} in room ${roomData.code}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to restore admin rights: ${err.message}`);
      return false;
    }
  }

  /**
   * Handles unapproved join attempts with specific feedback based on user status.
   *
   * @param socket - User's socket connection
   * @param status - Current user status in room
   * @param userName - User's display name
   * @param roomCode - Room code for logging
   */
  private handleUnapprovedJoinAttempt({
    socket,
    status,
    userName,
    roomCode,
  }: {
    socket: Socket;
    status: MeetingServiceParticipantStatus;
    userName: string;
    roomCode: string;
  }): void {
    switch (status) {
      case MeetingServiceParticipantStatus.Pending:
        socket.emit(WSGateWayOutgoingEvent.WaitingApproval);
        this.logger.log(`User ${userName} is pending approval for room ${roomCode}`);
        break;
      case MeetingServiceParticipantStatus.Rejected:
        socket.emit(WSGateWayOutgoingEvent.RejectedToJoin);
        this.logger.warn(`Rejected user ${userName} attempted to join room ${roomCode}`);
        break;
      case MeetingServiceParticipantStatus.Left:
        socket.emit(WSGateWayOutgoingEvent.JoinError, 'Vui lòng yêu cầu tham gia lại');
        this.logger.log(`User ${userName} needs to request to join room ${roomCode} again`);
        break;
      default:
        socket.emit(WSGateWayOutgoingEvent.JoinError, 'Bạn không được phép tham gia phòng');
        this.logger.warn(
          `User ${userName} attempted to join room ${roomCode} with invalid status: ${status}`,
        );
    }
  }

  /**
   * Handles duplicate connections by disconnecting old sessions.
   *
   * @param params - Connection parameters
   */
  private async handleDuplicateConnections({
    roomCode,
    userId,
    userName,
    currentSocket,
  }: {
    roomCode: string;
    userId: string;
    userName: string;
    currentSocket: Socket;
  }): Promise<void> {
    try {
      const existingSocket = await this.socketManager.findUserSocket(
        { roomCode, userId },
        this.server,
      );

      if (existingSocket && existingSocket.id !== currentSocket.id) {
        this.logger.warn(
          `User ${userName} already connected in room ${roomCode}, disconnecting old session ${existingSocket.id}`,
        );

        // Gracefully disconnect the old session
        existingSocket.emit(WSGateWayOutgoingEvent.JoinError, 'Bạn đã kết nối từ thiết bị khác');
        existingSocket.disconnect();

        // Small delay to ensure old connection is cleaned up
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (err) {
      this.logger.error(
        `Error handling duplicate connections for user ${userName}: ${err.message}`,
      );
      // Don't throw - this shouldn't block the join process
    }
  }

  /**
   * Executes all post-join operations including broadcasting and media sync.
   *
   * @param params - Post-join operation parameters
   */
  private async executePostJoinOperations({
    socket,
    roomCode,
    userName,
    isAdmin,
    roomData,
  }: {
    socket: Socket;
    roomCode: string;
    userName: string;
    isAdmin: boolean;
    roomData: MeetingServiceRoomModel;
  }): Promise<void> {
    try {
      // Get current connected sockets
      const connectedSocketIds = (await this.server.in(roomCode).fetchSockets()).map((s) => s.id);

      // Broadcast updated user list
      await this.roomManager.broadcastUsersInRoom({
        roomCode,
        connectedSocketIds,
        server: this.server,
      });

      const socketData = this.socketManager.getSocketData(socket.id);
      // Notify existing users of new participant
      const newUserMsg: WsGateWayUserOutput = {
        userId: socketData?.meta.userId ?? '',
        userName,
      };
      socket.to(roomCode).emit(WSGateWayOutgoingEvent.NewUser, newUserMsg);

      // Send admin-specific data if user is admin
      if (isAdmin) {
        const pendingUsers = roomData.participants.filter(
          (p) => p.status === MeetingServiceParticipantStatus.Pending,
        );
        socket.emit(WSGateWayOutgoingEvent.PendingUsers, { pendingUsers });
      }

      // Synchronize media producers
      this.mediasoupManager.syncProducers({
        socket,
        peers: connectedSocketIds,
        server: this.server,
      });

      this.logger.debug(`Post-join operations completed for ${userName} in room ${roomCode}`);
    } catch (err) {
      this.logger.error(`Error in post-join operations: ${err.message}`);
      throw err; // Re-throw to trigger cleanup
    }
  }

  /**
   * Cleans up resources when join operation fails.
   *
   * @param params - Cleanup parameters
   */
  private async cleanupFailedJoin({
    socket,
    roomCode,
    hasJoinedRoom,
    hasStoredSocket,
  }: {
    socket: Socket;
    roomCode: string;
    hasJoinedRoom: boolean;
    hasStoredSocket: boolean;
  }): Promise<void> {
    try {
      const cleanupTasks = [];

      if (hasJoinedRoom) {
        cleanupTasks.push(
          this.safeExecute({ fn: () => socket.leave(roomCode), label: 'Leave socket.io room' }),
        );
      }

      if (hasStoredSocket) {
        cleanupTasks.push(
          this.safeExecute({
            fn: () => this.socketManager.removeSocketData(socket.id),
            label: 'Remove socket data',
          }),
        );
      }

      await Promise.allSettled(cleanupTasks);

      this.logger.log(`🧹 Cleaned up failed join attempt for socket ${socket.id}`);
    } catch (cleanupErr) {
      this.logger.error(`Cleanup failed for socket ${socket.id}: ${cleanupErr.message}`);
    }
  }

  /**
   * Cleans up user's presence in room during disconnection.
   *
   * @param input - Cleanup parameters
   */
  private async cleanupRoomPresence({
    roomCode,
    userId,
    socket,
  }: {
    roomCode: string;
    userId: string;
    socket: Socket;
  }): Promise<void> {
    try {
      // Leave socket.io room
      socket.leave(roomCode);

      const userStatus = await this.roomManager.getUserStatusInRoom({
        roomCode,
        userId,
      });

      // Update user status in Redis with optimistic locking
      if (userStatus === MeetingServiceParticipantStatus.Approved) {
        await this.roomManager.setUserStatusWithLock({
          roomCode,
          userId,
          status: MeetingServiceParticipantStatus.Left,
        });
      }

      // Notify room of user departure
      socket.to(roomCode).emit(WSGateWayOutgoingEvent.UserLeft, { userId, socketId: socket.id });

      // Handle admin departure
      const adminSocketId = await this.roomManager.getRoomAdmin(roomCode);
      const isAdmin = adminSocketId === socket.id;
      if (isAdmin) {
        await this.roomManager.clearRoomAdmin(roomCode);
        await this.roomManager.setAdminOnlineWithLock({ roomCode, isOnline: false });
      }

      // Update users list
      const connectedSocketIds = (await this.server.in(roomCode).fetchSockets()).map((s) => s.id);
      await this.roomManager.broadcastUsersInRoom({
        roomCode,
        connectedSocketIds,
        server: this.server,
      });

      this.logger.log(`🚪 User ${userId} left room ${roomCode}`);
    } catch (err) {
      this.logger.error(`Failed to cleanup room presence: ${err.message}`);
    }
  }

  /**
   * Cleans up FFmpeg processes if any.
   *
   * @param socket - Socket to clean up
   */
  private cleanupFFmpeg(socket: Socket): void {
    const ffmpeg = socket.data?.ffmpeg;
    if (ffmpeg) {
      ffmpeg.kill('SIGKILL');
      this.logger.debug(`Killed FFmpeg process for socket ${socket.id}`);
    }
  }

  /**
   * Safely executes cleanup functions with error handling.
   *
   * @param input - Execution parameters
   * @param input.fn - Function to execute
   * @param input.label - Label for logging
   */
  private async safeExecute(input: {
    fn: () => void | Promise<void>;
    label: string;
  }): Promise<void> {
    try {
      await input.fn();
    } catch (err) {
      this.logger.error(`❌ ${input.label} cleanup error: ${err.message}`);
    }
  }

  /**
   * Validates that a user is approved to access MediaSoup operations.
   * Throws an error if user is not approved.
   *
   * @param input - Validation parameters
   * @param input.userId - The user ID to validate
   * @param input.socketId - The socket ID to get room context
   * @throws Error if user is not approved or not in a room
   */
  private async validateUserApproved(input: { userId: string; socketId: string }): Promise<void> {
    const socketData = this.socketManager.getSocketData(input.socketId);

    if (!socketData?.meta?.roomCode) {
      throw new WsException('User must be in a room to access MediaSoup operations');
    }

    const userStatus = await this.roomManager.getUserStatusInRoom({
      roomCode: socketData.meta.roomCode,
      userId: input.userId,
    });

    if (userStatus !== MeetingServiceParticipantStatus.Approved) {
      throw new WsException('Only approved users can access MediaSoup operations');
    }
  }

  /**
   * Gets comprehensive service statistics for monitoring.
   *
   * @returns Service statistics object
   */
  getServiceStats(): {
    sockets: ReturnType<typeof this.socketManager.getMemoryStats>;
    rooms: ReturnType<typeof this.roomManager.getMemoryStats>;
    timestamp: string;
  } {
    return {
      sockets: this.socketManager.getMemoryStats(),
      rooms: this.roomManager.getMemoryStats(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Performs periodic maintenance cleanup.
   * Should be called periodically to prevent memory leaks.
   */
  async performMaintenance(): Promise<void> {
    try {
      await Promise.all([
        this.socketManager.performMaintenanceCleanup(this.server),
        this.roomManager.performMaintenanceCleanup(this.server),
      ]);

      this.logger.log('🧹 Maintenance cleanup completed');
    } catch (err) {
      this.logger.error(`Maintenance cleanup failed: ${err.message}`);
    }
  }
}
