import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LarvaCourseServiceHistorySpeakingGqlOutput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  historyId?: string;

  @Field(() => String, { nullable: true })
  analyzeId?: string;

  @Field(() => Number, { nullable: true })
  mark?: number;

  @Field(() => String, { nullable: true })
  record?: string;

  @Field(() => String, { nullable: true })
  tenantId?: string;
}

@ObjectType()
export class LarvaCourseServiceHistoryGqlOutput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => String, { nullable: true })
  tenantId?: string;

  @Field(() => String, { nullable: true })
  lessonId?: string;

  @Field(() => String, { nullable: true })
  subjectCode?: string;

  @Field(() => String, { nullable: true })
  skillCode?: string;

  @Field(() => String, { nullable: true })
  categoryCode?: string;

  @Field(() => LarvaCourseServiceHistorySpeakingGqlOutput, { nullable: true })
  historySpeaking?: LarvaCourseServiceHistorySpeakingGqlOutput;
}
export class LarvaCourseServiceHistoryOutput extends LarvaCourseServiceHistoryGqlOutput {}
