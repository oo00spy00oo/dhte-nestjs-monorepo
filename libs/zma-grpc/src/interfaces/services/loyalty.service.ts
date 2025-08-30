import { MicroserviceInput, LoyaltyServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  LoyaltyServiceInputMapper,
  LoyaltyServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/loyalty';
import { Observable } from 'rxjs';

export interface LoyaltyService {
  loyaltyServiceGetDefaultLoyaltyProgram(
    input: MicroserviceInput<
      LoyaltyServiceInputMapper<LoyaltyServiceSubject.GetDefaultLoyaltyProgram>
    >,
  ): Observable<LoyaltyServiceOutputMapper<LoyaltyServiceSubject.GetDefaultLoyaltyProgram>>;

  loyaltyServiceGetDefaultLoyaltyTier(
    input: MicroserviceInput<
      LoyaltyServiceInputMapper<LoyaltyServiceSubject.GetDefaultLoyaltyTier>
    >,
  ): Observable<LoyaltyServiceOutputMapper<LoyaltyServiceSubject.GetDefaultLoyaltyTier>>;

  loyaltyServiceGetNextLoyaltyTier(
    input: MicroserviceInput<LoyaltyServiceInputMapper<LoyaltyServiceSubject.GetNextLoyaltyTier>>,
  ): Observable<LoyaltyServiceOutputMapper<LoyaltyServiceSubject.GetNextLoyaltyTier>>;

  loyaltyServiceGetLoyaltyTierById(
    input: MicroserviceInput<LoyaltyServiceInputMapper<LoyaltyServiceSubject.GetLoyaltyTierById>>,
  ): Observable<LoyaltyServiceOutputMapper<LoyaltyServiceSubject.GetLoyaltyTierById>>;
}
