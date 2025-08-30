import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class UserServiceUserCreatedEventKafkaInput {
  @IsNotEmpty()
  @IsString()
  requestId!: string;

  @IsNotEmpty()
  @IsString()
  tenantId!: string;

  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  appDomain?: string;
}

export class UserServiceUserActivityEventKafkaInput {
  @IsNotEmpty()
  @IsString()
  requestId!: string;

  @IsNotEmpty()
  @IsString()
  tenantId!: string;

  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsDateString()
  activityTimestamp!: string;

  @IsOptional()
  @IsString()
  activityType?: string;
}

export class UserServiceUserForgotPasswordEventKafkaInput {
  @IsNotEmpty()
  @IsString()
  requestId!: string;

  @IsNotEmpty()
  @IsString()
  tenantId!: string;

  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  appDomain?: string;
}
