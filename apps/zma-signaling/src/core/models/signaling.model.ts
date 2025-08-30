import { types } from 'mediasoup';

import { AiServiceTranslateLanguageEnum } from '../types';

export class RealTimeRoom {
  bufferVN: string;
  endpointTimer?: NodeJS.Timeout;
  clearTimer?: NodeJS.Timeout;
  targetLang: AiServiceTranslateLanguageEnum;
  clearGen: number;
}

export class WsGatewaySocketMapValue {
  meta?: {
    roomCode: string;
    userId: string;
    userName: string;
    transportConnected?: boolean;
    recvConnected?: boolean;
  };
  producers?: { id: string }[];
  consumers?: { id: string }[];
  transports?: {
    sendTransport?: types.WebRtcTransport;
    recvTransport?: types.WebRtcTransport;
  };
}

export class WsGatewayRoomMapValue {
  adminSocketId?: string;
  isRecording: boolean;
  realtimeState: RealTimeRoom;
}
