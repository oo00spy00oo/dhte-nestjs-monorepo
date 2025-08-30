import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentTenant, CurrentUser, Public } from '@zma-nestjs-monorepo/zma-decorators';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';
import { FnsServiceUserResponseGqlOutput } from '@zma-nestjs-monorepo/zma-types/outputs/fns';

import {
  FnsServiceCreateUserResponseFormGqlInput,
  FnsServiceCreateUserResponseSurveyGqlInput,
} from '../../core/inputs';
import { UserResponseUseCase } from '../../use-cases/user-response/user-response.use-case';

@Resolver()
export class UserResponseMutation {
  constructor(private userResponseUseCase: UserResponseUseCase) {}

  @Public()
  @Mutation(() => FnsServiceUserResponseGqlOutput)
  async fnsServiceCreateUserResponseToSurveyForAnonymous(
    @CurrentTenant() tenantId: string,
    @Args('input') input: FnsServiceCreateUserResponseSurveyGqlInput,
  ): Promise<FnsServiceUserResponseGqlOutput> {
    return this.userResponseUseCase.createUserResponseToSurvey({ tenantId, input });
  }

  @Mutation(() => FnsServiceUserResponseGqlOutput)
  async fnsServiceCreateUserResponseToSurvey(
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Args('input') input: FnsServiceCreateUserResponseSurveyGqlInput,
  ): Promise<FnsServiceUserResponseGqlOutput> {
    return this.userResponseUseCase.createUserResponseToSurvey({
      tenantId,
      input,
      userId: currentUser.id,
    });
  }

  @Public()
  @Mutation(() => FnsServiceUserResponseGqlOutput)
  async fnsServiceCreateUserResponseToFormForAnonymous(
    @CurrentTenant() tenantId: string,
    @Args('input') input: FnsServiceCreateUserResponseFormGqlInput,
  ): Promise<FnsServiceUserResponseGqlOutput> {
    return this.userResponseUseCase.createUserResponseToForm({ tenantId, input });
  }

  @Mutation(() => FnsServiceUserResponseGqlOutput)
  async fnsServiceCreateUserResponseToForm(
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Args('input') input: FnsServiceCreateUserResponseFormGqlInput,
  ): Promise<FnsServiceUserResponseGqlOutput> {
    return this.userResponseUseCase.createUserResponseToForm({
      tenantId,
      input,
      userId: currentUser.id,
    });
  }
}
