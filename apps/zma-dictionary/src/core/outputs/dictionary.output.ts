import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DictionaryServiceCrawlWordOutput {
  @Field(() => String)
  word!: string;

  @Field(() => String)
  partOfSpeech!: string;

  @Field(() => Boolean)
  isDone!: boolean;

  @Field(() => String, { nullable: true })
  errorMessage?: string;
}
