import {
  MicroserviceInput,
  TenantServiceSubject,
  UserServiceSubject,
} from '@zma-nestjs-monorepo/zma-types';
import {
  TenantServiceInputMapper,
  TenantServiceOutputMapper,
  UserServiceInputMapper,
  UserServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/user';
import { Observable } from 'rxjs';

export interface UserService {
  userServiceCreate(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.Create>>,
  ): Observable<UserServiceOutputMapper<UserServiceSubject.Create>>;

  userServiceCreateZaloUser(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.CreateZaloUser>>,
  ): Observable<UserServiceOutputMapper<UserServiceSubject.CreateZaloUser>>;

  userServiceUpdate(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.Update>>,
  ): Observable<UserServiceOutputMapper<UserServiceSubject.Update>>;

  userServiceDelete(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.Delete>>,
  ): Observable<UserServiceOutputMapper<UserServiceSubject.Delete>>;

  userServiceFindById(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.FindById>>,
  ): Observable<UserServiceOutputMapper<UserServiceSubject.FindById>>;

  userServiceFindByIdOnly(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.FindByIdOnly>>,
  ): Observable<UserServiceOutputMapper<UserServiceSubject.FindByIdOnly>>;

  userServiceFindByEmail(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.FindByEmail>>,
  ): Observable<UserServiceOutputMapper<UserServiceSubject.FindByEmail>>;

  userServiceFindByZaloIdAndTenantId(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.FindByZaloIdAndTenantId>>,
  ): Observable<UserServiceOutputMapper<UserServiceSubject.FindByZaloIdAndTenantId>>;

  tenantServiceFindById(
    data: MicroserviceInput<TenantServiceInputMapper<TenantServiceSubject.FindById>>,
  ): Observable<TenantServiceOutputMapper<TenantServiceSubject.FindById>>;

  tenantServiceFindByOrganizationId(
    data: MicroserviceInput<TenantServiceInputMapper<TenantServiceSubject.FindByOrganizationId>>,
  ): Observable<TenantServiceOutputMapper<TenantServiceSubject.FindByOrganizationId>>;

  userServiceFindZaloUsersByTenantId(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.FindZaloUsersByTenantId>>,
  ): Observable<UserServiceOutputMapper<UserServiceSubject.FindZaloUsersByTenantId>>;

  tenantServiceAllTenants(
    data: MicroserviceInput<TenantServiceInputMapper<TenantServiceSubject.AllTenants>>,
  ): Observable<TenantServiceOutputMapper<TenantServiceSubject.AllTenants>>;

  userServiceUpdateStatus(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.UpdateStatus>>,
  ): Observable<UserServiceOutputMapper<UserServiceSubject.UpdateStatus>>;

  userServiceConfirmByCode(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.ConfirmByCode>>,
  ): Observable<UserServiceOutputMapper<UserServiceSubject.ConfirmByCode>>;

  userServiceIncrementFailedLoginAttempts(
    input: MicroserviceInput<
      UserServiceInputMapper<UserServiceSubject.IncrementFailedLoginAttempts>
    >,
  ): Observable<UserServiceOutputMapper<UserServiceSubject.IncrementFailedLoginAttempts>>;

  userServiceResetVerificationCode(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.ResetVerificationCode>>,
  ): Observable<UserServiceOutputMapper<UserServiceSubject.ResetVerificationCode>>;

  userServiceUpdateSocialProviders(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.UpdateSocialProviders>>,
  ): Observable<UserServiceOutputMapper<UserServiceSubject.UpdateSocialProviders>>;

  userServiceValidateAgencyCanImpersonate(
    input: MicroserviceInput<
      UserServiceInputMapper<UserServiceSubject.ValidateAgencyCanImpersonate>
    >,
  ): Observable<UserServiceOutputMapper<UserServiceSubject.ValidateAgencyCanImpersonate>>;

  userServiceValidateOrganizationAdminCanImpersonate(
    input: MicroserviceInput<
      UserServiceInputMapper<UserServiceSubject.ValidateOrganizationAdminCanImpersonate>
    >,
  ): Observable<
    UserServiceOutputMapper<UserServiceSubject.ValidateOrganizationAdminCanImpersonate>
  >;
  userServiceFindByIds(
    input: MicroserviceInput<UserServiceInputMapper<UserServiceSubject.FindByIds>>,
  ): Observable<UserServiceOutputMapper<UserServiceSubject.FindByIds>>;
}
