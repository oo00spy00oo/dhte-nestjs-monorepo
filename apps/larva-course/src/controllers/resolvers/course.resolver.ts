import { Query, Resolver } from '@nestjs/graphql';
import { CurrentTenant, CurrentUser } from '@zma-nestjs-monorepo/zma-decorators';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';

import { LarvaCourseServiceSubjectsGqlOutput } from '../../core/outputs';
import { CourseUseCase } from '../../use-cases/course/course.use-case';

@Resolver()
export class CourseResolver {
  constructor(private useCase: CourseUseCase) {}

  @Query(() => [LarvaCourseServiceSubjectsGqlOutput])
  async larvaCourseServiceSubjects(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<LarvaCourseServiceSubjectsGqlOutput[]> {
    return this.useCase.getSubjectsData({ tenantId, userId: user.id });
  }
}
