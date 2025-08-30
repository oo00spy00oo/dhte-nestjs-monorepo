import { Injectable } from '@nestjs/common';
import {
  UserServiceUser,
  UserServiceUsersGlqOutput,
} from '@zma-nestjs-monorepo/zma-types/outputs/user/user';

import { UserEntity } from '../../frameworks/data-services/mongo/entities';

@Injectable()
export class UserFactoryService {
  transform(entity: UserEntity): UserServiceUser {
    const user: UserServiceUser = {
      _id: entity._id,
      email: entity.email,
      firstName: entity.firstName,
      lastName: entity.lastName,
      fullName: [entity.firstName, entity.lastName].filter(Boolean).join(' '),
      birthDate: entity.birthDate ? entity.birthDate.toISOString() : null,
      gender: entity.gender,
      type: entity.type,
      status: entity.status,
      tenantId: entity.tenantId,
      organizationId: entity.organizationId,
      socialProviders: entity.socialProviders,
      avatarUrl: entity.avatarUrl || null,
      phoneNumber: entity.phoneNumber,
      password: entity.password,
      zaloId: entity.zaloId,
      zaloOAId: entity?.zaloOAId ?? '',
      resetToken: entity.resetToken,
      resetTokenExpiry: entity.resetTokenExpiry?.toISOString() || '',
      failedLoginAttempts: entity.failedLoginAttempts,
      verificationCode: entity.verificationCode,
      lastActive: entity.lastActive?.toISOString() || '',
      createdAt: entity.createdAt?.toISOString() || '',
      updatedAt: entity.updatedAt?.toISOString() || '',
    };
    return user;
  }

  transformMany({
    entities,
    total,
  }: {
    entities: UserEntity[];
    total: number;
  }): UserServiceUsersGlqOutput {
    return {
      data: entities.map((entity) => this.transform(entity)),
      total,
    };
  }
}
