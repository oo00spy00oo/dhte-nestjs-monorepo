import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

@InputType()
export class CheckinServiceCheckinGqlInput {
  @IsNotEmpty()
  @IsUUID()
  @Field(() => String)
  userId!: string;
}

@InputType()
export class CheckinServiceGpsCheckinGqlInput extends CheckinServiceCheckinGqlInput {
  @IsNotEmpty()
  @IsNumber()
  @Field(() => Number)
  latitude!: number;

  @IsNotEmpty()
  @IsNumber()
  @Field(() => Number)
  longitude!: number;

  @IsNotEmpty()
  @IsNumber()
  @Field(() => Number)
  allowedLatitude!: number;

  @IsNotEmpty()
  @IsNumber()
  @Field(() => Number)
  allowedLongitude!: number;

  @IsNotEmpty()
  @IsNumber()
  @Field(() => Number)
  allowedRadius!: number;
}

@InputType()
export class CheckinServiceWifiCheckinGqlInput extends CheckinServiceCheckinGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  ssid!: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  bssid!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  allowedSSIDs!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  allowedBSSIDs!: string[];
}

@InputType()
export class CheckinServiceImageCheckinGqlInput extends CheckinServiceCheckinGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  imageFile!: string;
}

@InputType()
export class CheckinServiceQrCodeCheckinGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  qrCode!: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  allowedQrCode!: string;
}

export class CheckinServiceGpsCheckinInput extends CheckinServiceGpsCheckinGqlInput {}
export class CheckinServiceWifiCheckinInput extends CheckinServiceWifiCheckinGqlInput {}
export class CheckinServiceImageCheckinInput extends CheckinServiceImageCheckinGqlInput {}
export class CheckinServiceQrCodeCheckinInput extends CheckinServiceQrCodeCheckinGqlInput {}
