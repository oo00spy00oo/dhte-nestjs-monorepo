import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { WsAuthGuard, WsCurrentUser } from '@zma-nestjs-monorepo/zma-decorators';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';
import { Server, Socket } from 'socket.io';

import {
  WsGateWayApproveUserInput,
  WsGateWayConnectRecvTransportInput,
  WsGateWayConnectTransportInput,
  WsGateWayConsumeInput,
  WsGateWayJoinInput,
  WsGateWayKickInput,
  WsGateWayProduceInput,
  WsGateWayRejectUserInput,
  WSGateWayRequestJoinInput,
  WsGateWayStartRecordingInput,
  WsGateWayTranscriptInput,
} from '../../core/inputs';
import { WSGateWayIncomingEvent } from '../../core/types';

import { SignalingUseCase } from './signaling.use-case';

@UseGuards(WsAuthGuard)
@WebSocketGateway({
  namespace: '/signaling',
  cors: {
    origin: [
      'https://dev-streaming.dhte.vn',
      'http://localhost:3000',
      'http://172.17.0.1:3000',
      'http://localhost',
    ],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  path: '/socket.io/',
  serveClient: true,
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class SignalingWebSocketGateWay
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(SignalingWebSocketGateWay.name);

  constructor(private readonly signalingUseCase: SignalingUseCase) {}

  handleConnection(socket: Socket) {
    // Note: user won't be available here yet since the guard runs per-message
    this.logger.log(`🔌 Client connected: ${socket.id}`);
    this.logger.log(`🔗 Transport: ${socket.conn.transport.name}`);
    this.logger.log(`🌐 Client IP: ${socket.handshake.address}`);
  }

  afterInit(server: Server) {
    // Assign the initialized Socket.IO server instance to signalingUseCase
    this.signalingUseCase.server = server;

    this.logger.log('🚀 WebSocket Gateway initialized successfully');
    this.logger.log('📡 Socket.IO server is ready to accept connections');
  }

  async handleDisconnect(socket: Socket) {
    this.logger.log(`🔌 Client disconnected: ${socket.id}`);

    // Perform comprehensive cleanup
    await this.signalingUseCase.handleLeave(socket);
  }

  // ==== PING ====
  @SubscribeMessage(WSGateWayIncomingEvent.Ping)
  handlePing(@WsCurrentUser() user: AuthenticatedUser, @ConnectedSocket() socket: Socket) {
    this.logger.log(`📤 Ping from user: ${user.id} (${user.email})`);
    return this.signalingUseCase.handlePing(socket);
  }

  // ===== REQUEST JOIN =====
  @SubscribeMessage(WSGateWayIncomingEvent.RequestJoin)
  async onRequestJoin(
    @WsCurrentUser() user: AuthenticatedUser,
    @MessageBody()
    data: WSGateWayRequestJoinInput,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.signalingUseCase.handleRequestJoin({ socket, data, userId: user.id });
  }

  // ===== JOIN =====
  @SubscribeMessage(WSGateWayIncomingEvent.Join)
  async onJoin(
    @WsCurrentUser() user: AuthenticatedUser,
    @MessageBody() data: WsGateWayJoinInput,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.signalingUseCase.handleJoin({ socket, data, userId: user.id });
  }

  // ===== APPROVE USER =====
  @SubscribeMessage(WSGateWayIncomingEvent.ApproveUser)
  async onApproveUser(
    @MessageBody() data: WsGateWayApproveUserInput,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.signalingUseCase.handleApproveUser({ socket, data });
  }

  // ===== REJECT USER =====
  @SubscribeMessage(WSGateWayIncomingEvent.RejectUser)
  async onRejectUser(
    @MessageBody() data: WsGateWayRejectUserInput,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.signalingUseCase.handleRejectUser({ socket, data });
  }

  // ===== GET PENDING USERS =====
  @SubscribeMessage(WSGateWayIncomingEvent.GetPendingUsers)
  async onGetPendingUsers(@ConnectedSocket() socket: Socket) {
    return this.signalingUseCase.handleGetPendingUsers(socket);
  }

  // ===== KICK USER =====
  @SubscribeMessage(WSGateWayIncomingEvent.Kick)
  async onKick(@MessageBody() data: WsGateWayKickInput, @ConnectedSocket() socket: Socket) {
    return this.signalingUseCase.handleKick({ data, socket });
  }

  // ===== LEAVE =====
  @SubscribeMessage(WSGateWayIncomingEvent.Leave)
  async onLeave(@ConnectedSocket() socket: Socket) {
    return this.signalingUseCase.handleLeave(socket);
  }

  // ===== GET RTP CAPABILITIES =====
  @SubscribeMessage(WSGateWayIncomingEvent.GetRouterRtpCapabilities)
  async onGetRtpCapabilities(
    @WsCurrentUser() user: AuthenticatedUser,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.signalingUseCase.handleGetRtpCapabilities({ userId: user.id, socketId: socket.id });
  }

  // ===== CREATE TRANSPORT =====
  @SubscribeMessage(WSGateWayIncomingEvent.CreateTransport)
  async onCreateTransport(
    @WsCurrentUser() user: AuthenticatedUser,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.signalingUseCase.handleCreateTransport({ socket, userId: user.id });
  }

  // ===== CONNECT TRANSPORT =====
  @SubscribeMessage(WSGateWayIncomingEvent.ConnectTransport)
  async onConnectTransport(
    @WsCurrentUser() user: AuthenticatedUser,
    @MessageBody() data: WsGateWayConnectTransportInput,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.signalingUseCase.handleConnectTransport({ data, socket, userId: user.id });
  }

  // ===== CONNECT RECV TRANSPORT =====
  @SubscribeMessage(WSGateWayIncomingEvent.ConnectRecvTransport)
  async onConnectRecvTransport(
    @WsCurrentUser() user: AuthenticatedUser,
    @MessageBody() data: WsGateWayConnectRecvTransportInput,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.signalingUseCase.handleConnectRecvTransport({ data, socket, userId: user.id });
  }

  // ===== PRODUCE =====
  @SubscribeMessage(WSGateWayIncomingEvent.Produce)
  async onProduce(
    @WsCurrentUser() user: AuthenticatedUser,
    @MessageBody() data: WsGateWayProduceInput,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.signalingUseCase.handleProduce({ data, socket, userId: user.id });
  }

  // ===== CONSUME =====
  @SubscribeMessage(WSGateWayIncomingEvent.Consume)
  async onConsume(
    @WsCurrentUser() user: AuthenticatedUser,
    @MessageBody() data: WsGateWayConsumeInput,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.signalingUseCase.handleConsume({ data, socket, userId: user.id });
  }

  // ===== TRANSCRIPT =====
  @SubscribeMessage(WSGateWayIncomingEvent.Transcript)
  async onTranscript(
    @WsCurrentUser() user: AuthenticatedUser,
    @MessageBody() data: WsGateWayTranscriptInput,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.signalingUseCase.handleTranscript({ data, socket, userId: user.id });
  }

  // ===== STOP TRANSCRIPT =====
  @SubscribeMessage(WSGateWayIncomingEvent.StopTranscription)
  async onStopTranscript(
    @WsCurrentUser() user: AuthenticatedUser,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.signalingUseCase.handleStopTranscript({ socket, userId: user.id });
  }

  // ===== START RECORDING =====
  @SubscribeMessage(WSGateWayIncomingEvent.StartRecording)
  async onStartRecording(
    @WsCurrentUser() user: AuthenticatedUser,
    @MessageBody() data: WsGateWayStartRecordingInput,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.signalingUseCase.handleStartRecording({ socket, data, userId: user.id });
  }

  // ===== STOP RECORDING =====
  @SubscribeMessage(WSGateWayIncomingEvent.StopRecording)
  async onStopRecording(
    @WsCurrentUser() user: AuthenticatedUser,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.signalingUseCase.handleStopRecording({ socket, userId: user.id });
  }
}
