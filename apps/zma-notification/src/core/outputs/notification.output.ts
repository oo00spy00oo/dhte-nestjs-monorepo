import { Field, ObjectType } from '@nestjs/graphql';
import { LanguageEnum, NotificationServiceChannel } from '@zma-nestjs-monorepo/zma-types';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType({ description: 'Notification Service Output' })
export class NotificationServiceInAppNotificationGqlOutput {
  @Field(() => String, { name: 'id' })
  _id?: string;

  @Field(() => String, { nullable: true })
  tenantId?: string;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  content?: string;

  @Field(() => Boolean, { nullable: true })
  isRead?: boolean;

  @Field(() => Date, { nullable: true })
  readAt?: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, unknown>;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

@ObjectType({ description: 'Notification Service Template Output' })
export class NotificationServiceTemplateGqlOutput {
  @Field(() => String, { name: 'id' })
  _id?: string;

  @Field(() => String, { nullable: true })
  tenantId?: string;

  @Field(() => String, { nullable: true })
  code?: string;

  @Field(() => NotificationServiceChannel, { nullable: true })
  channel?: NotificationServiceChannel;

  @Field(() => LanguageEnum, { nullable: true })
  language?: LanguageEnum; // LanguageEnum

  @Field(() => String, { nullable: true })
  content?: string;

  @Field(() => String, { nullable: true })
  subject?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
