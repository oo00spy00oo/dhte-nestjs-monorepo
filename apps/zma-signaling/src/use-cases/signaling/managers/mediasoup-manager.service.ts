import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { types } from 'mediasoup';
import { Server, Socket } from 'socket.io';

import {
  WsGateWayConnectRecvTransportInput,
  WsGateWayConnectTransportInput,
  WsGateWayConsumeInput,
  WsGateWayHandleMessageInput,
  WsGateWayProduceInput,
} from '../../../core/inputs';
import {
  WsGateWayConnectRecvTransportOutput,
  WsGateWayConnectTransportOutput,
  WsGateWayConsumeOutput,
  WsGateWayHandleCreateTransportOutput,
  WsGateWayLogAnnouncedIpOutput,
  WsGateWayNewProducerOutput,
  WsGateWayProduceOutput,
} from '../../../core/outputs';
import { WSGateWayOutgoingEvent } from '../../../core/types';
import { MediasoupService } from '../../../services/mediasoup/mediasoup.service';

import { SocketManagerService } from './socket-manager.service';

/**
 * Manages WebRTC mediasoup operations including transport creation,
 * producer/consumer management, and real-time communication.
 *
 * This service handles:
 * - WebRTC transport creation and management
 * - Producer creation for media streams
 * - Consumer creation for receiving media
 * - Connection state management
 * - Media synchronization between peers
 */
@Injectable()
export class MediasoupManagerService {
  private readonly logger = new Logger(MediasoupManagerService.name);

  constructor(
    private readonly mediasoupService: MediasoupService,
    private readonly socketManager: SocketManagerService,
  ) {}

  /**
   * Gets RTP capabilities from the mediasoup router.
   * Required for client-side device configuration.
   *
   * @returns RTP capabilities for WebRTC communication
   */
  async getRtpCapabilities(): Promise<types.RtpCapabilities> {
    try {
      const capabilities = this.mediasoupService.getRouter().rtpCapabilities;
      this.logger.debug('Retrieved RTP capabilities');
      return capabilities;
    } catch (err) {
      this.logger.error(`Failed to get RTP capabilities: ${err.message}`);
      throw err;
    }
  }

  /**
   * Creates WebRTC transports for send and receive operations.
   * Configures proper listening IPs and transport settings.
   *
   * @param socket - The socket requesting transport creation
   * @returns Transport creation response with connection parameters
   */
  async createTransport(socket: Socket): Promise<WsGateWayHandleCreateTransportOutput> {
    try {
      const router = this.mediasoupService.getRouter();
      const listenIps = this.mediasoupService.getListenIps();

      // Create optimized transport configuration
      const transportConfig = {
        listenIps,
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
        // Add additional optimizations for better performance
        maxIncomingBitrate: 1500000, // 1.5 Mbps
        initialAvailableOutgoingBitrate: 1000000, // 1 Mbps
      };

      // Create both send and receive transports
      const [sendTransport, recvTransport] = await Promise.all([
        router.createWebRtcTransport(transportConfig),
        router.createWebRtcTransport(transportConfig),
      ]);

      // Store transport references for later use atomically
      await this.socketManager.setSocketData({
        socketId: socket.id,
        data: {
          transports: {
            sendTransport,
            recvTransport,
          },
        },
      });

      // Log announced IP for debugging
      const announcedIpMsg: WsGateWayLogAnnouncedIpOutput = {
        announcedIp: listenIps[0].announcedIp,
      };
      socket.emit(WSGateWayOutgoingEvent.LogAnnouncedIp, announcedIpMsg);

      this.logger.log(`Created transports for socket ${socket.id}`);

      return {
        id: sendTransport.id,
        iceParameters: sendTransport.iceParameters,
        iceCandidates: sendTransport.iceCandidates,
        dtlsParameters: sendTransport.dtlsParameters,
      };
    } catch (err) {
      this.logger.error(`Failed to create transport for socket ${socket.id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Connects the send transport with DTLS parameters.
   * Establishes secure WebRTC connection for sending media.
   *
   * @param params - Connection parameters
   * @param params.data - DTLS parameters for connection
   * @param params.socket - The socket requesting connection
   * @returns Connection result
   */
  async connectTransport({
    data,
    socket,
  }: WsGateWayHandleMessageInput<WsGateWayConnectTransportInput>): Promise<WsGateWayConnectTransportOutput> {
    const { dtlsParameters } = data;

    try {
      const socketData = this.socketManager.getSocketData(socket.id);

      if (!socketData?.transports?.sendTransport) {
        throw new WsException('Send transport not found');
      }

      await socketData.transports.sendTransport.connect({ dtlsParameters });

      // Update connection state atomically
      await this.socketManager.updateSocketMeta(socket.id, {
        transportConnected: true,
      });

      this.logger.log(`Send transport connected for socket ${socket.id}`);

      return { success: true };
    } catch (err) {
      this.logger.error(`Send transport connection failed for socket ${socket.id}: ${err.message}`);
      return {
        success: false,
        errorMessage: err.message,
      };
    }
  }

  /**
   * Connects the receive transport with DTLS parameters.
   * Establishes secure WebRTC connection for receiving media.
   *
   * @param params - Connection parameters
   * @param params.data - DTLS parameters for connection
   * @param params.socket - The socket requesting connection
   * @returns Connection result
   */
  async connectRecvTransport({
    data,
    socket,
  }: WsGateWayHandleMessageInput<WsGateWayConnectRecvTransportInput>): Promise<WsGateWayConnectRecvTransportOutput> {
    const { dtlsParameters } = data;

    try {
      const socketData = this.socketManager.getSocketData(socket.id);

      if (!socketData?.transports?.recvTransport) {
        throw new WsException('Receive transport not found');
      }

      await socketData.transports.recvTransport.connect({ dtlsParameters });

      // Update connection state atomically
      await this.socketManager.updateSocketMeta(socket.id, {
        recvConnected: true,
      });

      this.logger.log(`Receive transport connected for socket ${socket.id}`);

      return { success: true };
    } catch (err) {
      this.logger.error(
        `Receive transport connection failed for socket ${socket.id}: ${err.message}`,
      );
      return {
        success: false,
        errorMessage: err.message,
      };
    }
  }

  /**
   * Creates a producer for sending media streams.
   * Handles audio/video stream production with proper metadata.
   *
   * @param params - Producer creation parameters
   * @param params.data - RTP parameters and media kind
   * @param params.socket - The socket creating the producer
   * @param roomCode - The room code for broadcasting
   * @param server - Socket.IO server for broadcasting
   * @returns Producer creation result
   */
  async produce({
    data,
    socket,
    roomCode,
    server,
  }: WsGateWayHandleMessageInput<WsGateWayProduceInput> & {
    roomCode?: string;
    server?: Server;
  }): Promise<WsGateWayProduceOutput> {
    const { kind, rtpParameters } = data;

    try {
      const socketData = this.socketManager.getSocketData(socket.id);

      if (!socketData?.transports?.sendTransport) {
        throw new WsException('Send transport not found');
      }

      // Create producer with metadata
      const producer = await socketData.transports.sendTransport.produce({
        kind,
        rtpParameters,
      });

      // Add socket metadata to producer for tracking
      producer.appData = {
        socketId: socket.id,
        kind,
        createdAt: new Date(),
      };

      // Update socket data with new producer atomically
      const updatedProducers = [...(socketData.producers || []), { id: producer.id }];
      await this.socketManager.setSocketData({
        socketId: socket.id,
        data: {
          ...socketData,
          producers: updatedProducers,
        },
      });

      // Broadcast new producer to room if specified
      if (roomCode && server) {
        const broadcastMsg: WsGateWayNewProducerOutput = {
          producerId: producer.id,
          userId: socket.id,
        };

        socket.to(roomCode).emit(WSGateWayOutgoingEvent.NewProducer, broadcastMsg);
        this.logger.debug(`Broadcasted new producer ${producer.id} to room ${roomCode}`);
      }

      this.logger.log(`Created ${kind} producer ${producer.id} for socket ${socket.id}`);

      return { producerId: producer.id };
    } catch (err) {
      this.logger.error(`Failed to create producer for socket ${socket.id}: ${err.message}`);
      return { errorMessage: err.message };
    }
  }

  /**
   * Creates a consumer for receiving media streams.
   * Validates capabilities and establishes media consumption.
   *
   * @param params - Consumer creation parameters
   * @param params.data - Producer ID and RTP capabilities
   * @param params.socket - The socket creating the consumer
   * @returns Consumer creation result
   */
  async consume({
    data,
    socket,
  }: WsGateWayHandleMessageInput<WsGateWayConsumeInput>): Promise<WsGateWayConsumeOutput> {
    const { producerId, rtpCapabilities } = data;

    try {
      const router = this.mediasoupService.getRouter();

      // Validate if consumption is possible
      const canConsume = router.canConsume({
        producerId,
        rtpCapabilities,
      });

      if (!canConsume) {
        this.logger.warn(`Cannot consume producer ${producerId} for socket ${socket.id}`);
        return {
          errorMessage: 'Cannot consume this producer with given capabilities',
        };
      }

      const socketData = this.socketManager.getSocketData(socket.id);

      if (!socketData?.transports?.recvTransport) {
        throw new WsException('Receive transport not found');
      }

      // Create consumer with optimized settings
      const consumer = await socketData.transports.recvTransport.consume({
        producerId,
        rtpCapabilities,
        paused: false, // Start unpaused for better user experience
      });

      // Update socket data with new consumer atomically (store only ID as per interface)
      const updatedConsumers = [...(socketData.consumers || []), { id: consumer.id }];
      await this.socketManager.setSocketData({
        socketId: socket.id,
        data: {
          ...socketData,
          consumers: updatedConsumers,
        },
      });

      this.logger.log(
        `Created consumer ${consumer.id} for producer ${producerId}, socket ${socket.id}`,
      );

      return {
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        transportParams: {
          id: socketData.transports.recvTransport.id,
          iceParameters: socketData.transports.recvTransport.iceParameters,
          iceCandidates: socketData.transports.recvTransport.iceCandidates,
          dtlsParameters: socketData.transports.recvTransport.dtlsParameters,
        },
      };
    } catch (err) {
      this.logger.error(`Failed to create consumer for socket ${socket.id}: ${err.message}`);
      return { errorMessage: err.message };
    }
  }

  /**
   * Synchronizes producers between peers for media sharing.
   * Efficiently handles cross-peer producer notifications.
   *
   * @param params - Synchronization parameters
   * @param params.socket - The socket to synchronize
   * @param params.peers - Array of peer socket IDs
   * @param params.server - Socket.IO server for communication
   */
  syncProducers({
    socket,
    peers,
    server,
  }: {
    socket: Socket;
    peers: string[];
    server: Server;
  }): void {
    try {
      const myProducers = this.socketManager.getSocketData(socket.id)?.producers || [];

      // Process each peer efficiently
      peers.forEach((peerId) => {
        if (peerId === socket.id) return; // Skip self

        // Send existing peer producers to new user
        const peerProducers = this.socketManager.getSocketData(peerId)?.producers || [];
        peerProducers.forEach((producer) => {
          const message: WsGateWayNewProducerOutput = {
            producerId: producer.id,
            userId: peerId,
          };
          // Add slight delay to prevent overwhelming the client
          setTimeout(() => {
            socket.emit(WSGateWayOutgoingEvent.NewProducer, message);
          }, 100);
        });

        // Send new user's producers to existing peers
        myProducers.forEach((producer) => {
          const message: WsGateWayNewProducerOutput = {
            producerId: producer.id,
            userId: socket.id,
          };
          server.to(peerId).emit(WSGateWayOutgoingEvent.NewProducer, message);
        });
      });

      this.logger.debug(
        `Synchronized ${myProducers.length} producers for socket ${socket.id} with ${peers.length} peers`,
      );
    } catch (err) {
      this.logger.error(`Failed to sync producers for socket ${socket.id}: ${err.message}`);
    }
  }

  /**
   * Performs cleanup for socket's mediasoup resources.
   * Since we only store producer/consumer IDs, the actual resource cleanup
   * happens when the WebRTC transports are closed by SocketManagerService.
   *
   * @param socketId - The socket ID to cleanup
   */
  cleanupMediasoupResources(socketId: string): void {
    try {
      const socketData = this.socketManager.getSocketData(socketId);
      if (!socketData) return;

      const producerCount = socketData.producers?.length || 0;
      const consumerCount = socketData.consumers?.length || 0;

      // Log cleanup information for monitoring
      if (producerCount > 0) {
        this.logger.debug(`Cleaning up ${producerCount} producers for socket ${socketId}`);
        socketData.producers?.forEach((producer) => {
          this.logger.debug(`- Producer ${producer.id} marked for cleanup`);
        });
      }

      if (consumerCount > 0) {
        this.logger.debug(`Cleaning up ${consumerCount} consumers for socket ${socketId}`);
        socketData.consumers?.forEach((consumer) => {
          this.logger.debug(`- Consumer ${consumer.id} marked for cleanup`);
        });
      }

      // Note: Actual WebRTC resource cleanup (producers, consumers, transports)
      // happens automatically when transports are closed by SocketManagerService

      this.logger.log(
        `Marked mediasoup resources for cleanup: socket ${socketId} (${producerCount} producers, ${consumerCount} consumers)`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to cleanup mediasoup resources for socket ${socketId}: ${err.message}`,
      );
    }
  }

  /**
   * Gets statistics for mediasoup resource usage.
   * Useful for monitoring and optimization.
   *
   * @param socketId - The socket ID to get stats for
   * @returns Resource usage statistics
   */
  getResourceStats(socketId: string): {
    producerCount: number;
    consumerCount: number;
    transportConnected: boolean;
    recvConnected: boolean;
  } {
    const socketData = this.socketManager.getSocketData(socketId);

    return {
      producerCount: socketData?.producers?.length || 0,
      consumerCount: socketData?.consumers?.length || 0,
      transportConnected: socketData?.meta?.transportConnected || false,
      recvConnected: socketData?.meta?.recvConnected || false,
    };
  }
}
