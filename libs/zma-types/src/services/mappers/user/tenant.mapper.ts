import { FindByIdInput, FindByOrganizationIdInput } from '../../../common';
import { TenantServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import { UserServiceTenant } from '../../outputs/user';

export interface TenantServiceSubjectMapper {
  [TenantServiceSubject.FindById]: {
    input: FindByIdInput;
    output: UserServiceTenant;
  };
  [TenantServiceSubject.FindByOrganizationId]: {
    input: FindByOrganizationIdInput;
    output: {
      data: UserServiceTenant[];
    };
  };
  [TenantServiceSubject.AllTenants]: {
    input: void;
    output: {
      data: UserServiceTenant[];
    };
  };
}

export type TenantServiceInputMapper<T extends TenantServiceSubject> =
  TenantServiceSubjectMapper[T][KeyMapper.Input];
export type TenantServiceOutputMapper<T extends TenantServiceSubject> =
  TenantServiceSubjectMapper[T][KeyMapper.Output];
