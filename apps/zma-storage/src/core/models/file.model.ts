import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'File model' })
export class FileModel {
  @Field(() => String, { name: 'id' })
  _id?: string;

  @Field()
  name?: string;

  @Field({ nullable: true })
  fileName?: string;

  @Field({ nullable: true })
  size?: number;

  @Field()
  extension: string;

  @Field()
  mimeType: string;

  @Field({ nullable: true })
  path?: string;

  @Field()
  bucket: string;

  @Field()
  status: string;

  @Field()
  userId: string;

  @Field({ nullable: true })
  isUploaded?: boolean;

  @Field({ nullable: true })
  tempPresignedUrl?: string;

  @Field({ nullable: true })
  isDeleted?: boolean;

  @Field({ nullable: true })
  deletedAt?: Date;

  @Field({ nullable: true })
  contentHash?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}
