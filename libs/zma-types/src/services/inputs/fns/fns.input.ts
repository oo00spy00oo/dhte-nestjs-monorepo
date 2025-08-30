import { Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

export class FnsServiceFindUserResponseInput {
  @IsString()
  @Field(() => String, { nullable: true })
  formId?: string;

  @IsString()
  @Field(() => String, { nullable: true })
  surveyId?: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  userId!: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  tenantId!: string;
}
