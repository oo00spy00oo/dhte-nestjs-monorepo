import { MembershipServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import { MembershipServiceCreateMemberProfileInput } from '../../inputs/membership';
import { MembershipServiceMemberOutput } from '../../models/membership';

interface MembershipServiceMapper {
  [MembershipServiceSubject.CreateMemberProfile]: {
    [KeyMapper.Input]: MembershipServiceCreateMemberProfileInput;
    [KeyMapper.Output]: MembershipServiceMemberOutput;
  };
}

export type MembershipServiceInputMapper<T extends keyof MembershipServiceMapper> =
  MembershipServiceMapper[T][KeyMapper.Input];

export type MembershipServiceOutputMapper<T extends keyof MembershipServiceMapper> =
  MembershipServiceMapper[T][KeyMapper.Output];
