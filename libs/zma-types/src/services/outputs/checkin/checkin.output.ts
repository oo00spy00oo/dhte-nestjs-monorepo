import { Field, ObjectType } from '@nestjs/graphql';

import { CheckinMethodEnum } from '../../../enums';

@ObjectType()
export class GpsVerificationGqlOutput {
  @Field(() => Number)
  latitude!: number;

  @Field(() => Number)
  longitude!: number;
}

@ObjectType()
export class WiFiVerificationGqlOutput {
  @Field(() => String)
  ssid!: string;

  @Field(() => String)
  bssid!: string;
}

@ObjectType({
  description: 'Checkin Output',
})
export class CheckinServiceCheckinGqlOutput {
  @Field(() => String, { name: 'id' })
  _id?: string;

  @Field(() => String)
  tenantId?: string;

  @Field(() => String)
  userId!: string;

  @Field(() => String)
  checkinMethod!: CheckinMethodEnum;

  @Field(() => GpsVerificationGqlOutput, { nullable: true })
  gpsVerification?: GpsVerificationGqlOutput;

  @Field(() => WiFiVerificationGqlOutput, { nullable: true })
  wifiVerification?: WiFiVerificationGqlOutput;

  @Field(() => String, { nullable: true })
  imageVerification?: string;

  @Field(() => String, { nullable: true })
  qrCode?: string;

  @Field(() => Date)
  checkinTime!: Date;

  @Field(() => Boolean)
  isDeleted?: boolean;

  @Field(() => Date)
  createdAt?: Date;

  @Field(() => Date)
  updatedAt?: Date;
}

export class CheckinServiceStatusGqlOutput {
  @Field(() => Boolean)
  status!: boolean;

  @Field(() => String)
  checkinId?: string;
}

export class CheckinServiceCheckinOutput extends CheckinServiceCheckinGqlOutput {}
export class CheckinServiceStatusOutput extends CheckinServiceStatusGqlOutput {}
