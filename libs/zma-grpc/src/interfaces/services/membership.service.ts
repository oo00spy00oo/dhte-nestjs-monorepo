import { MicroserviceInput, MembershipServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  MembershipServiceInputMapper,
  MembershipServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/membership';
import { Observable } from 'rxjs';

export interface MembershipService {
  membershipServiceCreateMemberProfile(
    input: MicroserviceInput<
      MembershipServiceInputMapper<MembershipServiceSubject.CreateMemberProfile>
    >,
  ): Observable<MembershipServiceOutputMapper<MembershipServiceSubject.CreateMemberProfile>>;
}
