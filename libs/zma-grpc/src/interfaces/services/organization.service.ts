import { MicroserviceInput, OrganizationServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  OrganizationServiceInputMapper,
  OrganizationServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/organization';
import { Observable } from 'rxjs';

export interface OrganizationService {
  organizationServiceFindByUserId(
    input: MicroserviceInput<
      OrganizationServiceInputMapper<OrganizationServiceSubject.FindByUserId>
    >,
  ): Observable<OrganizationServiceOutputMapper<OrganizationServiceSubject.FindByUserId>>;

  organizationServiceFindById(
    input: MicroserviceInput<OrganizationServiceInputMapper<OrganizationServiceSubject.FindById>>,
  ): Observable<OrganizationServiceOutputMapper<OrganizationServiceSubject.FindById>>;

  organizationServiceCreate(
    input: MicroserviceInput<OrganizationServiceInputMapper<OrganizationServiceSubject.Create>>,
  ): Observable<OrganizationServiceOutputMapper<OrganizationServiceSubject.Create>>;

  organizationServiceUpdate(
    input: MicroserviceInput<OrganizationServiceInputMapper<OrganizationServiceSubject.Update>>,
  ): Observable<OrganizationServiceOutputMapper<OrganizationServiceSubject.Update>>;
}
