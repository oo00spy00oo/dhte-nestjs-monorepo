import {
  BooleanOutput,
  FindByIdInput,
  FindByMultipleIdsInput,
  FindByUserIdInput,
} from '../../../common';
import { KafkaTopic } from '../../../enums';
import { UserServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import {
  UserServiceUserActivityEventKafkaInput,
  UserServiceUserCreatedEventKafkaInput,
  UserServiceUserForgotPasswordEventKafkaInput,
} from '../../inputs/kafka';
import {
  FindZaloUsersByTenantIdInput,
  UserServiceConfirmByCodeInput,
  UserServiceCreateUserSubjectInput,
  UserServiceFindByEmailSubjectInput,
  UserServiceFindByZaloIdAndTenantIdSubjectInput,
  UserServiceUpdateStatusInput,
  UserServiceUpdateUserSubjectInput,
} from '../../inputs/user';
import { UserServiceUpdateSocialProviders, UserServiceUser } from '../../outputs/user/user.output';

export interface UserServiceSubjectMapper {
  [UserServiceSubject.Create]: {
    input: UserServiceCreateUserSubjectInput;
    output: UserServiceUser;
  };
  [UserServiceSubject.FindByEmail]: {
    input: UserServiceFindByEmailSubjectInput;
    output: UserServiceUser;
  };
  [UserServiceSubject.FindById]: {
    input: FindByIdInput;
    output: UserServiceUser;
  };
  [UserServiceSubject.FindByIdOnly]: {
    input: FindByUserIdInput;
    output: UserServiceUser;
  };
  [UserServiceSubject.FindByZaloIdAndTenantId]: {
    input: UserServiceFindByZaloIdAndTenantIdSubjectInput;
    output: UserServiceUser;
  };
  [UserServiceSubject.CreateZaloUser]: {
    input: UserServiceCreateUserSubjectInput;
    output: UserServiceUser;
  };
  [UserServiceSubject.Update]: {
    input: FindByIdInput & UserServiceUpdateUserSubjectInput;
    output: UserServiceUser;
  };
  [UserServiceSubject.Delete]: {
    input: FindByIdInput;
    output: BooleanOutput;
  };
  [UserServiceSubject.FindZaloUsersByTenantId]: {
    input: FindZaloUsersByTenantIdInput;
    output: {
      data: UserServiceUser[];
    };
  };
  [UserServiceSubject.UpdateStatus]: {
    input: UserServiceUpdateStatusInput;
    output: UserServiceUser;
  };
  [UserServiceSubject.ConfirmByCode]: {
    input: FindByIdInput & UserServiceConfirmByCodeInput;
    output: UserServiceUser;
  };
  [UserServiceSubject.IncrementFailedLoginAttempts]: {
    input: FindByIdInput;
    output: UserServiceUser;
  };
  [UserServiceSubject.ResetVerificationCode]: {
    input: FindByIdInput;
    output: UserServiceUser;
  };
  [UserServiceSubject.UpdateSocialProviders]: {
    input: FindByIdInput & UserServiceUpdateSocialProviders;
    output: UserServiceUser;
  };
  [UserServiceSubject.ValidateAgencyCanImpersonate]: {
    input: {
      agencyUserId: string;
      targetUserId: string;
      tenantId: string;
    };
    output: BooleanOutput;
  };
  [UserServiceSubject.ValidateOrganizationAdminCanImpersonate]: {
    input: {
      organizationAdminUserId: string;
      targetUserId: string;
      tenantId: string;
    };
    output: BooleanOutput;
  };
  [UserServiceSubject.FindByIds]: {
    input: FindByMultipleIdsInput;
    output: {
      data: UserServiceUser[];
    };
  };
}

export type UserServiceInputMapper<T extends UserServiceSubject> =
  UserServiceSubjectMapper[T][KeyMapper.Input];
export type UserServiceOutputMapper<T extends UserServiceSubject> =
  UserServiceSubjectMapper[T][KeyMapper.Output];

export interface UserServiceEventMapper {
  [KafkaTopic.UserCreatedEventTopic]: {
    input: UserServiceUserCreatedEventKafkaInput;
    output: void;
  };
  [KafkaTopic.UserForgotPasswordEventTopic]: {
    input: UserServiceUserForgotPasswordEventKafkaInput;
    output: void;
  };
  [KafkaTopic.UserActivityEventTopic]: {
    input: UserServiceUserActivityEventKafkaInput;
    output: void;
  };
}

export type UserServiceEventInputMapper<T extends keyof UserServiceEventMapper> =
  UserServiceEventMapper[T][KeyMapper.Input];
export type UserServiceEventOutputMapper<T extends keyof UserServiceEventMapper> =
  UserServiceEventMapper[T][KeyMapper.Output];
