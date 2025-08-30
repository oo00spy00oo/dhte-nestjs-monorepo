import { FeatureFlagServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import { FeatureFlagServiceGetFeatureFlagGqlInput } from '../../inputs/feature-flag';
import { FeatureFlagServiceFeatureFlagOutput } from '../../outputs/feature-flag';

export interface FeatureFlagServiceSubjectMapper {
  [FeatureFlagServiceSubject.GetEnableFeatures]: {
    input: FeatureFlagServiceGetFeatureFlagGqlInput;
    output: {
      data: FeatureFlagServiceFeatureFlagOutput[];
    };
  };
}

export type FeatureFlagServiceInputMapper<T extends FeatureFlagServiceSubject> =
  FeatureFlagServiceSubjectMapper[T][KeyMapper.Input];
export type FeatureFlagServiceOutputMapper<T extends FeatureFlagServiceSubject> =
  FeatureFlagServiceSubjectMapper[T][KeyMapper.Output];
