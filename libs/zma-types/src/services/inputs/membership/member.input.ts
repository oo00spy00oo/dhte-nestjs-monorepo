import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class MembershipServiceCreateMemberProfileInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tenantId!: string;
}
