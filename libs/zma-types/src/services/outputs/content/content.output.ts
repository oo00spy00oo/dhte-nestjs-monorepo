import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { ContentCategoryEnum, ContentStatusEnum, ContentTypeEnum } from '../../../enums';

registerEnumType(ContentTypeEnum, { name: 'ContentTypeEnum' });
registerEnumType(ContentCategoryEnum, { name: 'ContentCategoryEnum' });
registerEnumType(ContentStatusEnum, { name: 'ContentStatusEnum' });

@ObjectType({ description: 'Article' })
export class ContentServiceArticleGqlOutput {
  @Field(() => String, { name: 'id' })
  _id!: string;

  @Field()
  title?: string;

  @Field()
  viewCount?: number;

  @Field()
  content?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  eventDate?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  tenantId?: string;

  @Field({ nullable: true })
  hidden?: boolean;

  @Field(() => ContentTypeEnum)
  contentType?: ContentTypeEnum;

  @Field(() => ContentCategoryEnum)
  category?: ContentCategoryEnum;

  @Field(() => [String])
  tags?: string[];

  @Field()
  refId?: string;

  @Field(() => ContentStatusEnum)
  status?: ContentStatusEnum;

  @Field(() => Date, { nullable: true })
  publishedAt?: Date;

  @Field(() => Date)
  createdAt?: Date;

  @Field(() => Date)
  updatedAt?: Date;

  @Field()
  isDeleted?: boolean;
}

export class ContentServiceArticleOutput extends ContentServiceArticleGqlOutput {}
