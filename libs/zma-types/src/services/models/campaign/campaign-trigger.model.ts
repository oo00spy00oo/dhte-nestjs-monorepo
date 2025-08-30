import { Field, ID, ObjectType } from '@nestjs/graphql';

import { CampaignTriggerEventType } from '../../../types';

@ObjectType()
class CampaignTriggerConditions {
  @Field(() => Number, { nullable: true })
  pointsThreshold?: number;

  @Field(() => Number, { nullable: true })
  purchaseAmount?: number;

  @Field(() => [String], { nullable: true })
  productIds?: string[];

  @Field(() => [String], { nullable: true })
  categoryIds?: string[];
}

@ObjectType()
class CampaignTriggerActionItem {
  @Field()
  type!: string;

  @Field()
  value!: number;

  @Field(() => String, { nullable: true })
  voucherTypeId?: string;
}

@ObjectType()
class CampaignTriggerAction {
  @Field()
  type?: string;

  @Field()
  value?: number;

  @Field(() => [CampaignTriggerActionItem], { nullable: true })
  actions?: CampaignTriggerActionItem[];

  @Field(() => String, { nullable: true })
  voucherTypeId?: string;
}

@ObjectType()
export class CampaignServiceCampaignTriggerGqlOuput {
  @Field(() => ID)
  _id?: string;

  @Field()
  tenantId!: string;

  @Field()
  campaignId!: string;

  @Field(() => CampaignTriggerEventType)
  eventType!: CampaignTriggerEventType;

  @Field()
  sourceService!: string;

  @Field(() => CampaignTriggerConditions, { nullable: true })
  conditions?: CampaignTriggerConditions;

  @Field(() => CampaignTriggerAction)
  action!: CampaignTriggerAction;

  @Field()
  createdAt?: Date;

  @Field()
  updatedAt?: Date;
}

export class CampaignServiceCampaignTrigger extends CampaignServiceCampaignTriggerGqlOuput {}
