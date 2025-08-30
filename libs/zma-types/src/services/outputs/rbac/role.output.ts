import { AuthActionVerb, AuthPossession, AuthResource } from '../../../enums';

export class PermissionOutput {
  action!: AuthActionVerb;

  resource!: AuthResource;

  possession!: AuthPossession;
}

export class RoleOutput {
  id!: string;

  name!: string;

  description?: string;

  tenantId?: string;

  organizationId?: string;

  permissions!: PermissionOutput[];

  isActive!: boolean;

  isDeleted!: boolean;

  createdBy!: string;

  createdAt!: Date;

  updatedAt!: Date;
}
