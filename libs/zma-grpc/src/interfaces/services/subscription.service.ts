import { MicroserviceInput, SubscriptionServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  SubscriptionServiceInputMapper,
  SubscriptionServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/subscription';
import { Observable } from 'rxjs';

export interface SubscriptionService {
  subscriptionServiceGetSubscriptionByIdAndTenantId(
    input: MicroserviceInput<
      SubscriptionServiceInputMapper<SubscriptionServiceSubject.GetSubscriptionByIdAndTenantId>
    >,
  ): Observable<
    SubscriptionServiceOutputMapper<SubscriptionServiceSubject.GetSubscriptionByIdAndTenantId>
  >;
}
