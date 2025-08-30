import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Dictionary' })
export class Dictionary {
  @Field(() => String, { name: 'id' })
  _id?: string;
}
