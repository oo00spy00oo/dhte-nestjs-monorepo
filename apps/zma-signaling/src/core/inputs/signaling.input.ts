import { AiServiceTranslateLanguageEnum, MeetingServiceParticipantStatus } from '@zma-nestjs-monorepo/zma-types';
import { MeetingServiceRoomModel } from '@zma-nestjs-monorepo/zma-types/models/meeting';
import { IsNotEmpty, IsString } from 'class-validator';
import { types } from 'mediasoup';
import { DtlsParameters } from 'mediasoup/node/lib/WebRtcTransportTypes';
import { Socket } from 'socket.io';

export class WSGateWayRequestJoinInput {
  @IsString()
  @IsNotEmpty()
  userName!: string;

  @IsString()
  @IsNotEmpty()
  roomCode!: string;
}

export class WsGatewayRoomUserInput {
  socket?: Socket;
  userId: string;
  userName: string;
  roomData?: MeetingServiceRoomModel;
}

export class WsGatewayUpdateRoomRedisInput {
  roomCode: string;
  isOnline?: boolean;
  userId?: string;
  userName?: string;
  status?: MeetingServiceParticipantStatus;
}

export class WsGateWayHandleMessageInput<T> {
  socket: Socket;
  data: T;
  userId?: string;
}

export class WsGateWayJoinInput {
  @IsString()
  @IsNotEmpty()
  roomCode!: string;

  @IsString()
  @IsNotEmpty()
  userName!: string;
}

class WsGateWayUserActionInput {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class WsGateWayApproveUserInput extends WsGateWayUserActionInput {}

export class WsGateWayRejectUserInput extends WsGateWayUserActionInput {}

export class WsGateWayKickInput extends WsGateWayUserActionInput {}

export class WsGateWayConnectTransportInput {
  dtlsParameters: DtlsParameters;
}

export class WsGateWayConnectRecvTransportInput extends WsGateWayConnectTransportInput {}

export class WsGateWayProduceInput {
  @IsString()
  @IsNotEmpty()
  kind: 'audio' | 'video';

  @IsNotEmpty()
  rtpParameters: types.RtpParameters;
}

export class WsGateWayConsumeInput {
  @IsString()
  @IsNotEmpty()
  producerId!: string;

  @IsNotEmpty()
  rtpCapabilities!: types.RtpCapabilities;
}

export class WsGateWayTranscriptInput {
  @IsString()
  @IsNotEmpty()
  text!: string;
}

export class WsGateWayStartRecordingInput {
  @IsString()
  @IsNotEmpty()
  targetLang!: AiServiceTranslateLanguageEnum;

  @IsString()
  @IsNotEmpty()
  sourceLang!: AiServiceTranslateLanguageEnum;
}
