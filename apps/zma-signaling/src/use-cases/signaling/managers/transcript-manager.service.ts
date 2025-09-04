import { Injectable, Logger } from '@nestjs/common';
import { OpenAiService } from '@zma-nestjs-monorepo/zma-utils';
import { Server, Socket } from 'socket.io';

import { WsGateWayHandleMessageInput, WsGateWayTranscriptInput } from '../../../core/inputs';
import { RealTimeRoom } from '../../../core/models';
import { WsGateWayTranscriptEnOutput } from '../../../core/outputs';
import { AiServiceTranslateLanguageEnum, WSGateWayOutgoingEvent } from '../../../core/types';
import { MutexUtil } from '../../../utils';

import { RoomManagerService } from './room-manager.service';
import { SocketManagerService } from './socket-manager.service';

/**
 * Manages real-time transcription and translation services.
 * Handles speech-to-text processing, translation, and subtitle management.
 *
 * This service handles:
 * - Real-time transcript processing
 * - Text buffering and sentence detection
 * - AI-powered translation
 * - Subtitle timing and clearing
 * - Recording state management
 */
@Injectable()
export class TranscriptManagerService {
  private readonly logger = new Logger(TranscriptManagerService.name);

  // Optimized timing constants for better user experience
  private readonly PAUSE_MS = 900; // Time to wait before finalizing sentence
  private readonly CLEAR_AFTER_MS = 3500; // Time to keep subtitles visible

  /**
   * Mutex for transcript operations to prevent race conditions.
   */
  private transcriptMutex = new Map<string, Promise<void>>();

  constructor(
    private readonly aiService: OpenAiService,
    private readonly roomManager: RoomManagerService,
    private readonly socketManager: SocketManagerService,
  ) {}

  /**
   * Processes incoming transcript data with intelligent buffering and race condition protection.
   * Handles real-time speech-to-text input and manages sentence boundaries.
   *
   * @param params - Transcript processing parameters
   * @param params.data - Transcript text data
   * @param params.socket - The socket sending transcript
   * @param server - Socket.IO server for broadcasting
   */
  async handleTranscript({
    data,
    socket,
    server,
  }: WsGateWayHandleMessageInput<WsGateWayTranscriptInput> & {
    server: Server;
  }): Promise<void> {
    const { text } = data;

    try {
      const socketData = this.socketManager.getSocketData(socket.id);
      const roomCode = socketData?.meta?.roomCode;

      if (!roomCode) {
        this.logger.debug('No room code found for transcript - skipping');
        return;
      }

      // Use mutex to ensure atomic transcript processing
      return MutexUtil.withMutex({
        mutexMap: this.transcriptMutex,
        key: roomCode,
        operation: () => this.executeTranscriptProcessing(roomCode, socket, text, server),
        context: 'TranscriptManager',
      });
    } catch (err) {
      this.logger.error(`Failed to handle transcript: ${err.message}`);
    }
  }

  /**
   * Internal transcript processing logic with race condition protection.
   *
   * @param roomCode - The room code
   * @param socket - The socket sending transcript
   * @param text - The transcript text
   * @param server - Socket.IO server for broadcasting
   */
  private async executeTranscriptProcessing(
    roomCode: string,
    socket: Socket,
    text: string,
    server: Server,
  ): Promise<void> {
    // Verify admin permissions for transcript processing
    const adminSocketId = await this.roomManager.getRoomAdmin(roomCode);
    if (adminSocketId !== socket.id) {
      this.logger.debug(`Non-admin user ${socket.id} attempted transcript in room ${roomCode}`);
      return;
    }

    // Skip processing if recording is not enabled
    if (!(await this.roomManager.isRoomRecording(roomCode))) {
      this.logger.debug(`Room ${roomCode} not recording - skipping transcript`);
      return;
    }

    const roomRtState = await this.roomManager.getRoomRealtimeState(roomCode);
    if (!roomRtState) {
      this.logger.warn(`No real-time state found for room ${roomCode}`);
      return;
    }

    // Process transcript with intelligent buffering
    this.appendTextToBuffer({ roomRtState, text });
    this.scheduleTranscriptFinalization({ roomCode, roomRtState, server });
  }

  /**
   * Handles transcript stop event for cleanup.
   * Broadcasts stop signal to all room participants.
   *
   * @param socket - The socket stopping transcript
   * @param server - Socket.IO server for broadcasting
   */
  async handleStopTranscript(socket: Socket): Promise<void> {
    try {
      const socketData = this.socketManager.getSocketData(socket.id);
      const roomCode = socketData?.meta?.roomCode;

      if (!roomCode) return;

      // Verify admin permissions
      const adminSocketId = await this.roomManager.getRoomAdmin(roomCode);
      if (adminSocketId === socket.id) {
        socket.to(roomCode).emit(WSGateWayOutgoingEvent.StopTranscript);
        this.logger.log(`Admin stopped transcript for room ${roomCode}`);
      }
    } catch (err) {
      this.logger.error(`Failed to handle stop transcript: ${err.message}`);
    }
  }

  /**
   * Starts recording session with language configuration.
   * Initializes real-time state and clears previous buffers.
   *
   * @param params - Recording start parameters
   * @param params.targetLang - Target language for translation
   * @param params.sourceLang - Source language for speech recognition
   * @param socket - The socket starting recording
   */
  async startRecording({
    targetLang,
    sourceLang,
    socket,
  }: {
    targetLang: AiServiceTranslateLanguageEnum;
    sourceLang: string;
    socket: Socket;
  }): Promise<void> {
    try {
      const socketData = this.socketManager.getSocketData(socket.id);
      const roomCode = socketData?.meta?.roomCode;

      if (!roomCode) return;

      // Verify admin permissions
      const adminSocketId = await this.roomManager.getRoomAdmin(roomCode);
      if (adminSocketId !== socket.id) return;

      // Enable recording state
      await this.roomManager.setRoomRecording({ roomCode, isRecording: true });

      // Initialize/reset real-time state for new session
      const roomRtState = await this.roomManager.getRoomRealtimeState(roomCode);
      if (roomRtState) {
        this.resetRealTimeState(roomRtState, targetLang);
      }

      this.logger.log(`🎙️ Recording started for room ${roomCode}: ${sourceLang} → ${targetLang}`);
    } catch (err) {
      this.logger.error(`Failed to start recording: ${err.message}`);
    }
  }

  /**
   * Stops recording session with proper cleanup.
   * Preserves existing subtitles but stops new processing.
   *
   * @param socket - The socket stopping recording
   */
  async stopRecording(socket: Socket): Promise<void> {
    try {
      const socketData = this.socketManager.getSocketData(socket.id);
      const roomCode = socketData?.meta?.roomCode;

      if (!roomCode) return;

      // Verify admin permissions
      if ((await this.roomManager.getRoomAdmin(roomCode)) !== socket.id) return;

      // Disable recording state
      await this.roomManager.setRoomRecording({ roomCode, isRecording: false });

      const roomRtState = await this.roomManager.getRoomRealtimeState(roomCode);
      if (roomRtState) {
        // Cancel pending finalization but preserve clear timer
        if (roomRtState.endpointTimer) {
          clearTimeout(roomRtState.endpointTimer);
          roomRtState.endpointTimer = null;
        }

        // Clear buffer without finalizing
        roomRtState.bufferVN = '';
      }

      this.logger.log(`🛑 Recording stopped for room ${roomCode}`);
    } catch (err) {
      this.logger.error(`Failed to stop recording: ${err.message}`);
    }
  }

  // Private helper methods for transcript processing

  /**
   * Intelligently appends text to the buffer with whitespace handling.
   *
   * @param params - Text append parameters
   * @param params.roomRtState - Real-time room state
   * @param params.text - Text to append
   */
  private appendTextToBuffer({
    roomRtState,
    text,
  }: {
    roomRtState: RealTimeRoom;
    text: string;
  }): void {
    if (!text?.trim()) return;

    const cleanText = text.trim();
    const currentBuffer = (roomRtState.bufferVN || '').trim();

    // Intelligent buffer concatenation
    roomRtState.bufferVN = currentBuffer ? `${currentBuffer} ${cleanText}` : cleanText;

    this.logger.debug(`Buffer updated: "${roomRtState.bufferVN}"`);
  }

  /**
   * Schedules transcript finalization with intelligent timing.
   * Cancels previous timers to prevent overlapping processing.
   *
   * @param params - Finalization scheduling parameters
   * @param params.roomCode - The room code
   * @param params.roomRtState - Real-time room state
   * @param params.server - Socket.IO server for broadcasting
   */
  private scheduleTranscriptFinalization({
    roomCode,
    roomRtState,
    server,
  }: {
    roomCode: string;
    roomRtState: RealTimeRoom;
    server: Server;
  }): void {
    // Cancel existing timer to prevent duplicate processing
    if (roomRtState.endpointTimer) {
      clearTimeout(roomRtState.endpointTimer);
    }

    // Schedule finalization with optimized timing
    roomRtState.endpointTimer = setTimeout(() => {
      this.finalizeTranscriptSentence({ roomCode, roomRtState, server });
    }, this.PAUSE_MS);
  }

  /**
   * Finalizes transcript sentence with translation and broadcasting.
   * Handles sentence detection, translation, and subtitle management.
   *
   * @param params - Finalization parameters
   * @param params.roomCode - The room code
   * @param params.roomRtState - Real-time room state
   * @param params.server - Socket.IO server for broadcasting
   */
  private async finalizeTranscriptSentence({
    roomCode,
    roomRtState,
    server,
  }: {
    roomCode: string;
    roomRtState: RealTimeRoom;
    server: Server;
  }): Promise<void> {
    try {
      // Clear the endpoint timer
      roomRtState.endpointTimer = null;

      // Extract and process buffered text
      let vnText = this.extractAndClearBuffer(roomRtState);
      if (!vnText) return;

      // Ensure proper sentence termination
      vnText = this.ensureSentenceTerminator(vnText);

      // Handle sentence-end clearing logic
      if (this.isSentenceEnd(vnText)) {
        this.handleSentenceEndClearing({ roomCode, roomRtState, server });
      }

      // Translate and broadcast the text
      await this.translateAndEmitText({ roomCode, roomRtState, vnText, server });

      // Schedule automatic clearing
      this.scheduleAutoClear({ roomCode, roomRtState, server });

      this.logger.debug(`Finalized sentence for room ${roomCode}: "${vnText}"`);
    } catch (err) {
      this.logger.error(`Failed to finalize transcript sentence: ${err.message}`);
    }
  }

  /**
   * Extracts text from buffer and clears it atomically.
   *
   * @param roomRtState - Real-time room state
   * @returns Extracted text or empty string
   */
  private extractAndClearBuffer(roomRtState: RealTimeRoom): string {
    const vnText = (roomRtState.bufferVN || '').trim();
    roomRtState.bufferVN = '';
    return vnText;
  }

  /**
   * Ensures text ends with proper sentence terminator.
   *
   * @param text - Text to check and modify
   * @returns Text with proper termination
   */
  private ensureSentenceTerminator(text: string): string {
    if (!/[.!?…]$/.test(text)) {
      return text + '.';
    }
    return text;
  }

  /**
   * Checks if text represents end of sentence.
   *
   * @param text - Text to check
   * @returns True if sentence end detected
   */
  private isSentenceEnd(text: string): boolean {
    return /[.!?…]\s*$/.test(text);
  }

  /**
   * Handles immediate clearing when sentence ends.
   * Cancels pending clear timers and broadcasts clear event.
   *
   * @param params - Sentence end handling parameters
   * @param params.roomCode - The room code
   * @param params.roomRtState - Real-time room state
   * @param params.server - Socket.IO server for broadcasting
   */
  private handleSentenceEndClearing({
    roomCode,
    roomRtState,
    server,
  }: {
    roomCode: string;
    roomRtState: RealTimeRoom;
    server: Server;
  }): void {
    // Cancel pending clear timer
    if (roomRtState.clearTimer) {
      clearTimeout(roomRtState.clearTimer);
      roomRtState.clearTimer = null;
    }

    // Increment generation counter for race condition handling
    roomRtState.clearGen++;

    // Broadcast immediate clear
    server.to(roomCode).emit(WSGateWayOutgoingEvent.ClearSubtitle);

    this.logger.debug(`Immediate clear for room ${roomCode} (sentence end)`);
  }

  /**
   * Translates text and broadcasts to room participants.
   * Handles translation errors gracefully.
   *
   * @param params - Translation parameters
   * @param params.roomCode - The room code
   * @param params.roomRtState - Real-time room state
   * @param params.vnText - Vietnamese text to translate
   * @param params.server - Socket.IO server for broadcasting
   */
  private async translateAndEmitText({
    roomCode,
    roomRtState,
    vnText,
    server,
  }: {
    roomCode: string;
    roomRtState: RealTimeRoom;
    vnText: string;
    server: Server;
  }): Promise<void> {
    try {
      // Perform AI translation
      const translatedText = await this.aiService.translateText({
        targetLanguage: roomRtState.targetLang,
        text: vnText,
      });

      if (!translatedText) {
        this.logger.warn(`Translation empty for room ${roomCode} - keeping previous overlay`);
        return;
      }

      // Broadcast translated text
      const message: WsGateWayTranscriptEnOutput = {
        translatedText,
        targetLanguage: roomRtState.targetLang,
      };

      server.to(roomCode).emit(WSGateWayOutgoingEvent.TranscriptEn, message);

      this.logger.debug(`Broadcasted translation to room ${roomCode}: "${translatedText}"`);
    } catch (err) {
      this.logger.error(`Translation failed for room ${roomCode}: ${err.message}`);
    }
  }

  /**
   * Schedules automatic subtitle clearing with race condition protection.
   *
   * @param params - Auto-clear parameters
   * @param params.roomCode - The room code
   * @param params.roomRtState - Real-time room state
   * @param params.server - Socket.IO server for broadcasting
   */
  private scheduleAutoClear({
    roomCode,
    roomRtState,
    server,
  }: {
    roomCode: string;
    roomRtState: RealTimeRoom;
    server: Server;
  }): void {
    // Create generation snapshot for race condition handling
    const genSnapshot = ++roomRtState.clearGen;

    // Cancel existing clear timer
    if (roomRtState.clearTimer) {
      clearTimeout(roomRtState.clearTimer);
    }

    // Schedule clear with generation checking
    roomRtState.clearTimer = setTimeout(() => {
      // Only clear if this is still the latest generation
      if (genSnapshot === roomRtState.clearGen) {
        server.to(roomCode).emit(WSGateWayOutgoingEvent.ClearSubtitle);
        roomRtState.clearTimer = null;
        this.logger.debug(`Auto-cleared subtitles for room ${roomCode}`);
      }
    }, this.CLEAR_AFTER_MS);
  }

  /**
   * Resets real-time state for new recording session.
   *
   * @param roomRtState - Real-time room state to reset
   * @param targetLang - Target language for translation
   */
  private resetRealTimeState(
    roomRtState: RealTimeRoom,
    targetLang: AiServiceTranslateLanguageEnum,
  ): void {
    // Clear all buffers and timers
    roomRtState.bufferVN = '';

    if (roomRtState.endpointTimer) {
      clearTimeout(roomRtState.endpointTimer);
      roomRtState.endpointTimer = null;
    }

    if (roomRtState.clearTimer) {
      clearTimeout(roomRtState.clearTimer);
      roomRtState.clearTimer = null;
    }

    // Reset generation counter and set target language
    roomRtState.clearGen = 0;
    roomRtState.targetLang = targetLang;

    this.logger.debug(`Reset real-time state with target language: ${targetLang}`);
  }

  /**
   * Gets transcript processing statistics for monitoring.
   *
   * @param roomCode - The room code to get stats for
   * @returns Processing statistics
   */
  async getTranscriptStats(roomCode: string): Promise<{
    isRecording: boolean;
    bufferLength: number;
    targetLanguage: AiServiceTranslateLanguageEnum;
    clearGeneration: number;
    hasActiveTimers: boolean;
  }> {
    const roomRtState = await this.roomManager.getRoomRealtimeState(roomCode);
    const isRecording = await this.roomManager.isRoomRecording(roomCode);

    if (!roomRtState) {
      return {
        isRecording,
        bufferLength: 0,
        targetLanguage: AiServiceTranslateLanguageEnum.EN,
        clearGeneration: 0,
        hasActiveTimers: false,
      };
    }

    return {
      isRecording,
      bufferLength: roomRtState.bufferVN?.length || 0,
      targetLanguage: roomRtState.targetLang,
      clearGeneration: roomRtState.clearGen,
      hasActiveTimers: !!(roomRtState.endpointTimer || roomRtState.clearTimer),
    };
  }
}
