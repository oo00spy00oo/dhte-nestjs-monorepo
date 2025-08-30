import { SetMetadata } from '@nestjs/common';
import {
  AuthActionVerb,
  AuthPossession,
  AuthResource,
  RBAC_PERMISSIONS_KEY,
} from '@zma-nestjs-monorepo/zma-types';

export interface RbacPermission {
  action: AuthActionVerb;
  resource: AuthResource;
  possession: AuthPossession;
}

export const UseRbacPermissions = (permission: RbacPermission) =>
  SetMetadata(RBAC_PERMISSIONS_KEY, permission);
