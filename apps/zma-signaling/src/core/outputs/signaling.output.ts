import { AiServiceTranslateLanguageEnum } from '@zma-nestjs-monorepo/zma-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { types } from 'mediasoup';

export class MediaSoupServiceGetListenIpsOutput {
  @IsString()
  @IsNotEmpty()
  ip: string;

  @IsString()
  @IsOptional()
  announcedIp?: string;
}

export class WsGateWayUserOutput {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  userName: string;
}

export class WsGateWayUsersInRoomOutput {
  @IsOptional()
  @IsString()
  adminSocketId: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WsGateWayUserOutput)
  users: WsGateWayUserOutput[];
}

export class WsGateWayNewProducerOutput {
  @IsString()
  @IsNotEmpty()
  producerId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class WsGateWayHandleCreateTransportOutput {
  id: string;
  iceParameters: types.IceParameters;
  iceCandidates: types.IceCandidate[];
  dtlsParameters: types.DtlsParameters;
}

export class WsGateWayLogAnnouncedIpOutput {
  @IsString()
  @IsNotEmpty()
  announcedIp: string;
}

export class WsGateWayConnectTransportOutput {
  @IsBoolean()
  success: boolean;

  @IsString()
  @IsOptional()
  errorMessage?: string;
}

export class WsGateWayConnectRecvTransportOutput extends WsGateWayConnectTransportOutput {}

export class WsGateWayProduceOutput {
  @IsString()
  @IsOptional()
  producerId?: string;

  @IsString()
  @IsOptional()
  errorMessage?: string;
}

export class WsGateWayConsumeOutput {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  producerId?: string;

  @IsString()
  @IsOptional()
  kind?: string;

  @IsOptional()
  rtpParameters?: types.RtpParameters;

  @IsOptional()
  transportParams?: {
    id: string;
    iceParameters: types.IceParameters;
    iceCandidates: types.IceCandidate[];
    dtlsParameters: types.DtlsParameters;
  };

  @IsString()
  @IsOptional()
  errorMessage?: string;
}

export class WsGateWayTranscriptEnOutput {
  @IsString()
  @IsNotEmpty()
  translatedText: string;

  @IsString()
  @IsNotEmpty()
  targetLanguage: AiServiceTranslateLanguageEnum;
}
