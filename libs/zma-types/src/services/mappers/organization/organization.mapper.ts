import { FindByIdInput } from '../../../common';
import { OrganizationServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import { OrganizationServiceOrganization } from '../../outputs/organization';

export interface OrganizationServiceSubjectMapper {
  [OrganizationServiceSubject.FindByUserId]: {
    input: { userId: string };
    output: {
      data: OrganizationServiceOrganization[];
    };
  };
  [OrganizationServiceSubject.FindById]: {
    input: FindByIdInput;
    output: OrganizationServiceOrganization;
  };
  [OrganizationServiceSubject.Create]: {
    input: {
      name: string;
      logo?: string;
      isEnterprise?: boolean;
      domain?: string;
      userId: string;
    };
    output: OrganizationServiceOrganization;
  };
  [OrganizationServiceSubject.Update]: {
    input: FindByIdInput & {
      name: string;
      logo?: string;
      isEnterprise?: boolean;
      domain?: string;
    };
    output: OrganizationServiceOrganization;
  };
}

export type OrganizationServiceInputMapper<T extends OrganizationServiceSubject> =
  OrganizationServiceSubjectMapper[T][KeyMapper.Input];
export type OrganizationServiceOutputMapper<T extends OrganizationServiceSubject> =
  OrganizationServiceSubjectMapper[T][KeyMapper.Output];
