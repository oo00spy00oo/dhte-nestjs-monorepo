import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'File' })
export class Presigned {
  @Field(() => String)
  fileId: string;

  @Field(() => String)
  presignedUrl: string;
}
