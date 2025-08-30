import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ServiceName } from '../../../enums';
import { CampaignActionType, CampaignTriggerEventType } from '../../../types';

@InputType()
class CampaignTriggerConditionsInput {
  @Field(() => Number, { nullable: true })
  @IsOptional()
  pointsThreshold?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  purchaseAmount?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  productIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  categoryIds?: string[];
}

@InputType()
class CampaignTriggerActionItemInput {
  @Field(() => CampaignActionType)
  type!: CampaignActionType;

  @Field(() => Number)
  value!: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  voucherTypeId?: string;
}

@InputType()
class CampaignTriggerActionInput {
  @Field(() => CampaignActionType)
  type!: CampaignActionType;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  value?: number;

  @Field(() => [CampaignTriggerActionItemInput], { nullable: true })
  @IsOptional()
  actions?: CampaignTriggerActionItemInput[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  voucherTypeId?: string;
}

@InputType()
export class CampaignServiceCampaignTriggerGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field()
  tenantId!: string;

  @IsNotEmpty()
  @IsString()
  @Field()
  campaignId!: string;

  @Field(() => CampaignTriggerEventType)
  @IsEnum(CampaignTriggerEventType)
  eventType!: CampaignTriggerEventType;

  @Field(() => ServiceName)
  @IsEnum(ServiceName)
  @IsNotEmpty()
  sourceService!: ServiceName;

  @Field(() => CampaignTriggerConditionsInput, { nullable: true })
  @IsOptional()
  conditions?: CampaignTriggerConditionsInput;

  @Field(() => CampaignTriggerActionInput)
  @IsOptional()
  action?: CampaignTriggerActionInput;
}

@InputType()
export class CampaignServiceUpdateCampaignTriggerGqlInput extends CampaignServiceCampaignTriggerGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field()
  id!: string;
}
