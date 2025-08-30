import { Field, InputType, Int } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

// @ArgsType()
@InputType()
export class PaginationArgs {
  @Field(() => Int, { nullable: true })
  @Min(0)
  skip = 0;

  @Field(() => Int, { nullable: true })
  @Min(1)
  @Max(30)
  limit = 10;
}
