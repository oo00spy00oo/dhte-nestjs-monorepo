import { FeatureFlagServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import { MicroserviceInput } from '@zma-nestjs-monorepo/zma-types';
import {
  FeatureFlagServiceInputMapper,
  FeatureFlagServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/feature-flag';
import { Observable } from 'rxjs';

export interface FeatureFlagService {
  featureFlagServiceGetEnableFeatures(
    input: MicroserviceInput<
      FeatureFlagServiceInputMapper<FeatureFlagServiceSubject.GetEnableFeatures>
    >,
  ): Observable<FeatureFlagServiceOutputMapper<FeatureFlagServiceSubject.GetEnableFeatures>>;
}
