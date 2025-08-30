import { LoyaltyServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import {
  LoyaltyServiceGetDefaultLoyaltyProgramInput,
  LoyaltyServiceGetDefaultLoyaltyTierInput,
  LoyaltyServiceGetLoyaltyTierByIdInput,
  LoyaltyServiceGetNextLoyaltyTierGqlInput,
} from '../../inputs/loyalty';
import {
  LoyaltyServiceLoyaltyProgramOutput,
  LoyaltyServiceLoyaltyTierOutput,
} from '../../models/loyalty';

interface LoyaltyServiceMapper {
  [LoyaltyServiceSubject.GetDefaultLoyaltyProgram]: {
    [KeyMapper.Input]: LoyaltyServiceGetDefaultLoyaltyProgramInput;
    [KeyMapper.Output]: LoyaltyServiceLoyaltyProgramOutput;
  };
  [LoyaltyServiceSubject.GetDefaultLoyaltyTier]: {
    [KeyMapper.Input]: LoyaltyServiceGetDefaultLoyaltyTierInput;
    [KeyMapper.Output]: LoyaltyServiceLoyaltyTierOutput;
  };
  [LoyaltyServiceSubject.GetNextLoyaltyTier]: {
    [KeyMapper.Input]: LoyaltyServiceGetNextLoyaltyTierGqlInput;
    [KeyMapper.Output]: LoyaltyServiceLoyaltyTierOutput;
  };
  [LoyaltyServiceSubject.GetLoyaltyTierById]: {
    [KeyMapper.Input]: LoyaltyServiceGetLoyaltyTierByIdInput;
    [KeyMapper.Output]: LoyaltyServiceLoyaltyTierOutput;
  };
}

export type LoyaltyServiceInputMapper<T extends keyof LoyaltyServiceMapper> =
  LoyaltyServiceMapper[T][KeyMapper.Input];

export type LoyaltyServiceOutputMapper<T extends keyof LoyaltyServiceMapper> =
  LoyaltyServiceMapper[T][KeyMapper.Output];
