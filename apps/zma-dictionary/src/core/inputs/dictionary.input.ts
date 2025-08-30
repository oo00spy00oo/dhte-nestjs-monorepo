import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsString, ValidateNested } from 'class-validator';

@InputType()
export class DictionaryServiceCrawlWordGqlInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  word!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  partOfSpeech!: string;
}

@InputType()
export class DictionaryServiceCrawlWordsGqlInput {
  @Field(() => [DictionaryServiceCrawlWordGqlInput])
  @ValidateNested({ each: true })
  @Type(() => DictionaryServiceCrawlWordGqlInput)
  words!: DictionaryServiceCrawlWordGqlInput[];

  @IsInt()
  @IsPositive()
  @Field(() => Number)
  concurrency!: number;
}
