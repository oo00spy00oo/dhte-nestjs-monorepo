import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { LanguageEnum, NotificationServiceChannel } from '@zma-nestjs-monorepo/zma-types';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

registerEnumType(NotificationServiceChannel, {
  name: 'NotificationServiceChannel',
});

registerEnumType(LanguageEnum, {
  name: 'LanguageEnum',
});

export class NotificationServiceCreateInAppNotificationGqlInput {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  content!: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}

@InputType({
  description: 'Input for creating a notification service template',
})
export class NotificationServiceCreateTemplateGqlInput {
  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  code!: string;

  @IsNotEmpty()
  @IsEnum(NotificationServiceChannel)
  @Field(() => NotificationServiceChannel)
  channel!: NotificationServiceChannel;

  @IsNotEmpty()
  @IsEnum(LanguageEnum)
  @Field(() => LanguageEnum)
  language!: LanguageEnum;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  content!: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  subject?: string;
}

@InputType({
  description: 'Input for updating a notification service template',
})
export class NotificationServiceUpdateTemplateGqlInput {
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  code?: string;

  @IsOptional()
  @IsEnum(NotificationServiceChannel)
  @Field(() => NotificationServiceChannel, { nullable: true })
  channel?: NotificationServiceChannel;

  @IsOptional()
  @IsEnum(LanguageEnum)
  @Field(() => LanguageEnum, { nullable: true })
  language?: LanguageEnum;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  content?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  subject?: string;
}
