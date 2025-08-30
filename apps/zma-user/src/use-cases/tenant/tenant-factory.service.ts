import { Injectable } from '@nestjs/common';
import { UserServiceTenant } from '@zma-nestjs-monorepo/zma-types/outputs/user/tenant';

import { TenantEntity } from '../../frameworks/data-services/mongo/entities';

@Injectable()
export class TenantFactoryService {
  transform(entity: TenantEntity): UserServiceTenant {
    if (entity?._id) {
      entity._id = entity._id.toString();
    }
    const tenant: UserServiceTenant = {
      _id: entity._id,
      name: entity.name,
      status: entity.status,
      billingStatus: entity.billingStatus,
      type: entity.type,
      organizationId: entity.organizationId,
      zaloAppId: entity.zaloAppId,
      zaloAppSecret: entity.zaloAppSecret,
      oaId: entity.oaId,
      registerEnabled: entity.registerEnabled,
      miniAppUrl: entity?.miniAppUrl ?? '',
      favicon: entity?.favicon,
      title: entity?.title,
      banner: entity?.banner,
      description: entity?.description,
      domain: entity?.domain,
      logo: entity?.logo,
      createdAt: entity.createdAt?.toISOString() || '',
      updatedAt: entity.updatedAt?.toISOString() || '',
    };
    return tenant;
  }

  transformForZaloUser(entity: TenantEntity): UserServiceTenant {
    if (entity?._id) {
      entity._id = entity._id.toString();
    }
    const tenant: UserServiceTenant = {
      _id: entity._id,
      name: entity.name,
      status: entity.status,
      billingStatus: entity.billingStatus,
      type: entity.type,
      organizationId: entity.organizationId,
      zaloAppId: '',
      zaloAppSecret: '',
      oaId: entity.oaId,
      registerEnabled: entity.registerEnabled,
      miniAppUrl: entity?.miniAppUrl ?? '',
      favicon: entity?.favicon ?? '',
      title: entity?.title,
      banner: entity?.banner,
      description: entity?.description,
      domain: entity?.domain,
      logo: entity?.logo,
      createdAt: entity.createdAt?.toISOString() || '',
      updatedAt: entity.updatedAt?.toISOString() || '',
    };
    return tenant;
  }
}
