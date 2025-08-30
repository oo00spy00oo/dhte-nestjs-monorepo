import { Mutation, Args, Resolver } from '@nestjs/graphql';
import { CurrentTenant } from '@zma-nestjs-monorepo/zma-decorators';

import {
  LarvaCourseServiceCreateLessonGqlInput,
  LarvaCourseServiceUpdateLessonGqlInput,
} from '../../core/inputs';
import { LessonUseCase } from '../../use-cases/lesson/lesson.use-case';

@Resolver()
export class LessonMutation {
  constructor(private useCase: LessonUseCase) {}

  @Mutation(() => Boolean)
  async larvaCourseServiceCreateLessonSpeaking(
    @Args('input') input: LarvaCourseServiceCreateLessonGqlInput,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.useCase.createLessonSpeaking({ input, tenantId });
  }

  @Mutation(() => Boolean)
  async larvaCourseServiceUpdateLessonSpeaking(
    @Args('id') id: string,
    @Args('input') input: LarvaCourseServiceUpdateLessonGqlInput,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    return this.useCase.updateLessonSpeaking({ id, input, tenantId });
  }
}
