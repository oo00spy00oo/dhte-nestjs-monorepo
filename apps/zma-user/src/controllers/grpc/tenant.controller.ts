import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import {
  MicroserviceInput,
  ServiceName,
  TenantServiceSubject,
} from '@zma-nestjs-monorepo/zma-types';
import {
  TenantServiceInputMapper,
  TenantServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/user';

import { TenantUseCase } from '../../use-cases/tenant/tenant.use-case';

@Controller()
export class TenantGrpcController {
  constructor(private readonly tenantUseCase: TenantUseCase) {}

  @GrpcMethod(ServiceName.USER, TenantServiceSubject.FindById)
  async getTenant(
    @Payload() input: MicroserviceInput<TenantServiceInputMapper<TenantServiceSubject.FindById>>,
  ): Promise<TenantServiceOutputMapper<TenantServiceSubject.FindById>> {
    return this.tenantUseCase.getTenantById(input.data.id);
  }

  @GrpcMethod(ServiceName.USER, TenantServiceSubject.FindByOrganizationId)
  async getTenantsByOrganizationId(
    @Payload()
    input: MicroserviceInput<TenantServiceInputMapper<TenantServiceSubject.FindByOrganizationId>>,
  ): Promise<TenantServiceOutputMapper<TenantServiceSubject.FindByOrganizationId>> {
    return {
      data: await this.tenantUseCase.getTenantsByOrganizationId(input.data.organizationId),
    };
  }

  @GrpcMethod(ServiceName.USER, TenantServiceSubject.AllTenants)
  async allTenants(): Promise<TenantServiceOutputMapper<TenantServiceSubject.AllTenants>> {
    return {
      data: await this.tenantUseCase.fetchAllTenants(),
    };
  }
}
