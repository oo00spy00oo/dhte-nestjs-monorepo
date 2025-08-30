import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MicroserviceInput, ServiceName, UserServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  UserServiceInputMapper,
  UserServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/user';

import { UserUseCase } from '../../use-cases/user/user.use-case';

@Controller()
export class UserGrpcController {
  private readonly logger = new Logger(UserGrpcController.name);
  constructor(private readonly userUseCase: UserUseCase) {}

  @GrpcMethod(ServiceName.USER, UserServiceSubject.Create)
  handleUserCreate(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.Create>>,
  ): Promise<UserServiceOutputMapper<UserServiceSubject.Create>> {
    this.logger.debug(input, 'handleUserCreate');
    return this.userUseCase.createUser({ tenantId: input.data.tenantId, input: input.data });
  }

  @GrpcMethod(ServiceName.USER, UserServiceSubject.CreateZaloUser)
  handleUserCreateZalo(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.CreateZaloUser>>,
  ): Promise<UserServiceOutputMapper<UserServiceSubject.CreateZaloUser>> {
    this.logger.debug(input, 'handleUserCreateZalo');
    return this.userUseCase.createZaloUser({ tenantId: input.data.tenantId, input: input.data });
  }

  @GrpcMethod(ServiceName.USER, UserServiceSubject.Update)
  handleUserUpdate(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.Update>>,
  ): Promise<UserServiceOutputMapper<UserServiceSubject.Update>> {
    this.logger.debug(input, 'handleUserUpdate');
    return this.userUseCase.updateUser({
      userId: input.data.id,
      tenantId: input.data.tenantId,
      input: input.data,
    });
  }

  @GrpcMethod(ServiceName.USER, UserServiceSubject.Delete)
  handleUserDelete(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.Delete>>,
  ): Promise<UserServiceOutputMapper<UserServiceSubject.Delete>> {
    this.logger.debug(input, 'handleUserDelete');
    return this.userUseCase.deleteUsers({ tenantId: input.data.tenantId, ids: [input.data.id] });
  }

  @GrpcMethod(ServiceName.USER, UserServiceSubject.FindById)
  handleUserFind(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.FindById>>,
  ): Promise<UserServiceOutputMapper<UserServiceSubject.FindById>> {
    this.logger.debug(input, 'handleUserFind');
    return this.userUseCase.findById({ tenantId: input.data.tenantId, id: input.data.id });
  }

  @GrpcMethod(ServiceName.USER, UserServiceSubject.FindByIdOnly)
  handleUserFindByIdOnly(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.FindByIdOnly>>,
  ): Promise<UserServiceOutputMapper<UserServiceSubject.FindByIdOnly>> {
    this.logger.debug(input, 'handleUserFindByIdOnly');
    return this.userUseCase.findByIdWithoutTenant({ id: input.data.userId });
  }

  @GrpcMethod(ServiceName.USER, UserServiceSubject.FindByEmail)
  handleUserFindByEmail(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.FindByEmail>>,
  ): Promise<UserServiceOutputMapper<UserServiceSubject.FindByEmail>> {
    this.logger.debug(input, 'handleUserFindByEmail');
    return this.userUseCase.findByEmail({ tenantId: input.data.tenantId, email: input.data.email });
  }

  @GrpcMethod(ServiceName.USER, UserServiceSubject.FindByZaloIdAndTenantId)
  handleUserFindByZaloIdAndTenantId(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.FindByZaloIdAndTenantId>>,
  ): Promise<UserServiceOutputMapper<UserServiceSubject.FindByZaloIdAndTenantId>> {
    this.logger.debug(input, 'handleUserFindByZaloIdAndTenantId');
    return this.userUseCase.findByZaloIdAndTenantId({
      tenantId: input.data.tenantId,
      zaloId: input.data.zaloId,
    });
  }

  @GrpcMethod(ServiceName.USER, UserServiceSubject.FindZaloUsersByTenantId)
  async handleUserFindZaloUsersByTenantId(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.FindZaloUsersByTenantId>>,
  ): Promise<UserServiceOutputMapper<UserServiceSubject.FindZaloUsersByTenantId>> {
    this.logger.debug(input, 'handleUserFindZaloUsersByTenantId');
    const result = await this.userUseCase.findZaloUsersByTenantId({
      tenantId: input.data.tenantId,
    });
    return { data: result };
  }

  @GrpcMethod(ServiceName.USER, UserServiceSubject.UpdateStatus)
  async handleUserUpdateStatus(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.UpdateStatus>>,
  ): Promise<UserServiceOutputMapper<UserServiceSubject.UpdateStatus>> {
    this.logger.debug(input, 'handleUserUpdateStatus');
    return this.userUseCase.updateStatus({
      tenantId: input.data.tenantId,
      id: input.data.id,
      status: input.data.status,
    });
  }

  @GrpcMethod(ServiceName.USER, UserServiceSubject.ConfirmByCode)
  async handleUserConfirmByCode(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.ConfirmByCode>>,
  ): Promise<UserServiceOutputMapper<UserServiceSubject.ConfirmByCode>> {
    this.logger.debug(input, 'handleUserConfirmByToken');
    return this.userUseCase.confirmByCode({
      tenantId: input.data.tenantId,
      userId: input.data.id,
      code: input.data.code,
    });
  }

  @GrpcMethod(ServiceName.USER, UserServiceSubject.IncrementFailedLoginAttempts)
  async handleUserIncrementFailedLoginAttempts(
    input: MicroserviceInput<
      UserServiceInputMapper<UserServiceSubject.IncrementFailedLoginAttempts>
    >,
  ): Promise<UserServiceOutputMapper<UserServiceSubject.IncrementFailedLoginAttempts>> {
    this.logger.debug(input, 'handleUserIncrementFailedLoginAttempts');
    return this.userUseCase.incrementFailedLoginAttempts({
      tenantId: input.data.tenantId,
      userId: input.data.id,
    });
  }

  @GrpcMethod(ServiceName.USER, UserServiceSubject.ResetVerificationCode)
  async handleUserResetVerificationCode(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.ResetVerificationCode>>,
  ): Promise<UserServiceOutputMapper<UserServiceSubject.ResetVerificationCode>> {
    this.logger.debug(input, 'handleUserResetVerificationCode');
    return this.userUseCase.resetVerificationCode({
      tenantId: input.data.tenantId,
      id: input.data.id,
    });
  }

  @GrpcMethod(ServiceName.USER, UserServiceSubject.UpdateSocialProviders)
  async handleUserUpdateSocialProviders(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.UpdateSocialProviders>>,
  ): Promise<UserServiceOutputMapper<UserServiceSubject.UpdateSocialProviders>> {
    this.logger.debug(input, 'handleUserUpdateSocialProviders');
    return this.userUseCase.updateSocialProviders({
      tenantId: input.data.tenantId,
      id: input.data.id,
      socialProviders: input.data.socialProviders,
    });
  }

  @GrpcMethod(ServiceName.USER, UserServiceSubject.ValidateAgencyCanImpersonate)
  async handleValidateAgencyCanImpersonate(
    input: MicroserviceInput<
      UserServiceInputMapper<UserServiceSubject.ValidateAgencyCanImpersonate>
    >,
  ): Promise<{ status: boolean }> {
    this.logger.debug(input, 'handleValidateAgencyCanImpersonate');
    const result = await this.userUseCase.validateAgencyCanImpersonate({
      agencyUserId: input.data.agencyUserId,
      targetUserId: input.data.targetUserId,
      tenantId: input.data.tenantId,
    });
    return { status: result };
  }

  @GrpcMethod(ServiceName.USER, UserServiceSubject.ValidateOrganizationAdminCanImpersonate)
  async handleValidateOrganizationAdminCanImpersonate(
    input: MicroserviceInput<
      UserServiceInputMapper<UserServiceSubject.ValidateOrganizationAdminCanImpersonate>
    >,
  ): Promise<{ status: boolean }> {
    this.logger.debug(input, 'handleValidateOrganizationAdminCanImpersonate');
    const result = await this.userUseCase.validateOrganizationAdminCanImpersonate({
      organizationAdminUserId: input.data.organizationAdminUserId,
      targetUserId: input.data.targetUserId,
      tenantId: input.data.tenantId,
    });
    return { status: result };
  }

  @GrpcMethod(ServiceName.USER, UserServiceSubject.FindByIds)
  async handleUserFindByIds(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.FindByIds>>,
  ): Promise<UserServiceOutputMapper<UserServiceSubject.FindByIds>> {
    this.logger.debug(input, 'handleUserFindByIds');
    const data = await this.userUseCase.getUsers({
      tenantId: input.data.tenantId,
      ids: input.data.ids,
    });
    return { data };
  }
}
