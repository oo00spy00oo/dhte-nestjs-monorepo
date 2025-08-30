import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

import { MeetingServiceParticipantStatus } from '../../../enums';

export class MeetingServiceParticipantModel {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  userName!: string;

  @IsEnum(MeetingServiceParticipantStatus)
  status!: MeetingServiceParticipantStatus;

  @IsDate()
  @Type(() => Date)
  joinedAt?: Date;
}

export class MeetingServiceRoomModel {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsBoolean()
  isActive?: boolean;

  @IsString()
  @IsNotEmpty()
  adminId!: string;

  @IsBoolean()
  isAdminOnline?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeetingServiceParticipantModel)
  participants: MeetingServiceParticipantModel[] = [];
}
