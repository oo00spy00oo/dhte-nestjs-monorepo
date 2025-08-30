import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

import { ContentCategoryEnum, ContentStatusEnum, ContentTypeEnum } from '../../../enums';
import { IsNotIncludedBase64 } from '../../../validator';

@InputType()
export class ContentServiceArticleGqlInput {
  @IsString()
  @Field({ nullable: false })
  title?: string;

  @IsNotIncludedBase64()
  @Field({ nullable: false })
  content?: string;

  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsOptional()
  @Field({ nullable: true })
  eventDate?: string;

  @IsOptional()
  @Field({ nullable: true })
  imageUrl?: string;

  @IsOptional()
  @IsEnum(ContentTypeEnum)
  @Field(() => ContentTypeEnum)
  contentType?: ContentTypeEnum;

  @IsOptional()
  @IsEnum(ContentCategoryEnum)
  @Field(() => ContentCategoryEnum)
  category?: ContentCategoryEnum;

  @IsOptional()
  @IsArray()
  @Field(() => [String])
  tags?: string[];
}

@InputType()
export class ContentServiceSearchArticleGqlInput {
  @IsOptional()
  @IsEnum(ContentCategoryEnum)
  @Field(() => ContentCategoryEnum, { nullable: true })
  category?: ContentCategoryEnum;

  @IsOptional()
  @IsEnum(ContentStatusEnum)
  @Field(() => ContentStatusEnum, { nullable: true })
  status?: ContentStatusEnum;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  content?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  title?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  id?: string;
}

@InputType()
export class ContentServiceUpdateArticleGqlInput {
  @IsString()
  @Field({ nullable: true })
  title?: string;

  @IsNotIncludedBase64()
  @Field({ nullable: true })
  content?: string;

  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsOptional()
  @Field({ nullable: true })
  eventDate?: string;

  @IsOptional()
  @Field({ nullable: true })
  imageUrl?: string;

  @IsOptional()
  @IsEnum(ContentTypeEnum)
  @Field(() => ContentTypeEnum, { nullable: true })
  contentType?: ContentTypeEnum;

  @IsOptional()
  @IsEnum(ContentCategoryEnum)
  @Field(() => ContentCategoryEnum, { nullable: true })
  category?: ContentCategoryEnum;

  @IsOptional()
  @IsArray()
  @Field(() => [String], { nullable: true })
  tags?: string[];
}

export class ContentServiceArticleInput extends ContentServiceArticleGqlInput {}

export class ContentServiceUpdateArticleInput extends ContentServiceUpdateArticleGqlInput {}

export class ContentServiceSearchArticleInput extends ContentServiceSearchArticleGqlInput {}
