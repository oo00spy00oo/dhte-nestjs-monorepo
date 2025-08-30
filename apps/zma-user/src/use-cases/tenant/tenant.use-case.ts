import { Injectable } from '@nestjs/common';
import { Exception } from '@zma-nestjs-monorepo/zma-middlewares';
import {
  ErrorCode,
  Pagination,
  UserServiceTenantBillingStatus,
  UserServiceTenantStatus,
  UserServiceTenantType,
} from '@zma-nestjs-monorepo/zma-types';
import {
  UserServiceCreateTenantGqlInput,
  UserServiceTenantStatusGqlInput,
  UserServiceTenantTypeGqlInput,
  UserServiceUpdateTenantGqlInput,
} from '@zma-nestjs-monorepo/zma-types/inputs/user';
import { UserServiceTenant } from '@zma-nestjs-monorepo/zma-types/outputs/user/tenant';
import { I18nService } from 'nestjs-i18n';

import { IDataServices } from '../../core/abstracts';

import { TenantFactoryService } from './tenant-factory.service';

@Injectable()
export class TenantUseCase {
  constructor(
    private dataServices: IDataServices,
    private factoryService: TenantFactoryService,
    private readonly i18n: I18nService,
  ) {}

  async getAllTenant(
    organizationId: string,
    pagination: Pagination & {
      sortBy?: string;
      sortDirection?: string;
      status?: string;
      name?: string;
    },
  ): Promise<UserServiceTenant[]> {
    if (!organizationId) {
      throw new Exception(ErrorCode.ORGANIZATION_NOT_FOUND);
    }

    // Build filter object
    const filter: Record<string, unknown> = { organizationId };

    // Add status filter if provided
    if (pagination.status) {
      filter.status = pagination.status;
    }

    // Add name filter if provided (case-insensitive partial match)
    if (pagination.name) {
      filter.name = { $regex: pagination.name, $options: 'i' };
    }

    // Build sort object
    let sort: string | Record<string, number> = { createdAt: -1 }; // Default sort
    if (pagination.sortBy) {
      const direction = pagination.sortDirection === 'ASC' ? 1 : -1;
      sort = { [pagination.sortBy]: direction };
    }

    const entities = await this.dataServices.tenantService.findMany({
      find: { filter },
      options: {
        skip: pagination.skip,
        limit: pagination.limit,
        sort,
      },
    });
    return entities.map((entity) => this.factoryService.transform(entity));
  }

  async getTenant(organizationId: string, id: string): Promise<UserServiceTenant> {
    if (!organizationId) {
      throw new Exception(ErrorCode.ORGANIZATION_NOT_FOUND);
    }
    if (!id) {
      throw new Exception(ErrorCode.TENANT_NOT_FOUND);
    }
    const entity = await this.dataServices.tenantService.findOne({
      find: { filter: { _id: id, organizationId } },
    });

    if (!entity) {
      throw new Exception(ErrorCode.TENANT_NOT_FOUND);
    }

    return this.factoryService.transform(entity);
  }

  async getTenantById(id: string): Promise<UserServiceTenant> {
    const entity = await this.dataServices.tenantService.findById({ id });

    if (!entity) {
      throw new Exception(ErrorCode.TENANT_NOT_FOUND);
    }

    return this.factoryService.transform(entity);
  }

  async getTenantByIdForZaloUser(id: string): Promise<UserServiceTenant> {
    if (!id) {
      throw new Exception(ErrorCode.TENANT_NOT_FOUND);
    }
    const entity = await this.dataServices.tenantService.findById({ id });

    if (!entity) {
      throw new Exception(ErrorCode.TENANT_NOT_FOUND);
    }

    return this.factoryService.transformForZaloUser(entity);
  }

  async getTenantsByOrganizationId(organizationId: string): Promise<UserServiceTenant[]> {
    const entities = await this.dataServices.tenantService.findMany({
      find: { filter: { organizationId } },
    });

    return entities.map((entity) => this.factoryService.transform(entity));
  }

  async createTenant(
    organizationId: string,
    input: UserServiceCreateTenantGqlInput,
  ): Promise<UserServiceTenant> {
    if (!organizationId) {
      throw new Exception(ErrorCode.ORGANIZATION_NOT_FOUND);
    }
    const entity = await this.dataServices.tenantService.create({
      item: {
        ...input,
        organizationId: organizationId,
        zaloAppId: input.zaloAppId,
        zaloAppSecret: input.zaloAppSecret,
        status: UserServiceTenantStatus.Active,
        billingStatus: UserServiceTenantBillingStatus.Trial,
        type: UserServiceTenantType.Base,
      },
    });

    return this.factoryService.transform(entity);
  }

  async updateTenant(
    organizationId: string,
    input: UserServiceUpdateTenantGqlInput,
  ): Promise<UserServiceTenant> {
    if (!organizationId) {
      throw new Exception(ErrorCode.ORGANIZATION_NOT_FOUND);
    }
    const tenant = await this.getTenant(organizationId, input.id);
    if (!tenant) {
      throw new Exception(ErrorCode.TENANT_NOT_FOUND);
    }

    const entity = await this.dataServices.tenantService.updateOne({
      id: input.id,
      update: {
        item: {
          ...input,
          oaId: input.oaId ?? tenant.oaId,
          zaloAppId: input.zaloAppId ?? tenant.zaloAppId,
          zaloAppSecret: input.zaloAppSecret ?? tenant.zaloAppSecret,
        },
      },
    });

    return this.factoryService.transform(entity);
  }

  async tenantStatus(
    organizationId: string,
    input: UserServiceTenantStatusGqlInput,
  ): Promise<UserServiceTenant> {
    if (!organizationId) {
      throw new Exception(ErrorCode.ORGANIZATION_NOT_FOUND);
    }
    const tenant = await this.getTenant(organizationId, input.id);
    if (!tenant) {
      throw new Exception(ErrorCode.TENANT_NOT_FOUND);
    }

    const entity = await this.dataServices.tenantService.updateOne({
      id: input.id,
      update: { item: { status: input.status } },
    });

    return this.factoryService.transform(entity);
  }

  async updateTenantType(input: UserServiceTenantTypeGqlInput): Promise<UserServiceTenant> {
    const tenant = await this.getTenantById(input.id);
    if (!tenant) {
      throw new Exception(ErrorCode.TENANT_NOT_FOUND);
    }

    const entity = await this.dataServices.tenantService.updateOne({
      id: input.id,
      update: { item: { type: input.type } },
    });

    return this.factoryService.transform(entity);
  }

  async fetchAllTenants(): Promise<UserServiceTenant[]> {
    const entities = await this.dataServices.tenantService.findMany({
      find: { filter: { status: UserServiceTenantStatus.Active } },
    });
    return entities.map((entity) => this.factoryService.transform(entity));
  }

  async getTenantIdFromDomain(domain: string): Promise<string | null> {
    const tenant = await this.dataServices.tenantService.findOne({
      find: { filter: { domain, isDeleted: false } },
    });

    return tenant?._id ?? null;
  }

  async getTenantByDomain(domain: string): Promise<UserServiceTenant | null> {
    const entity = await this.dataServices.tenantService.findOne({
      find: { filter: { domain, isDeleted: false } },
    });

    if (!entity) {
      return null;
    }

    return this.factoryService.transformForZaloUser(entity);
  }
}
