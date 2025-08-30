import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
@InputType({ description: 'Analyze Speaking Input' })
export class LarvaCourseServiceAnalyzeSpeakingGqlInput {
  @Field(() => String, { description: 'Speech To Text' })
  @IsString()
  @IsNotEmpty()
  speechToText!: string;

  @Field(() => String, { description: 'Record', nullable: true })
  @IsString()
  @IsOptional()
  record?: string;

  @Field(() => String, { description: 'Lesson Speaking ID' })
  @IsString()
  @IsNotEmpty()
  lessonSpeakingId!: string;
}
