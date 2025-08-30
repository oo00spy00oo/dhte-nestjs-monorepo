import { MicroserviceInput, ShippingServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  ShippingServiceInputMapper,
  ShippingServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/shipping';
import { Observable } from 'rxjs';

export interface ShippingService {
  shippingServiceShippingMethodAvailable(
    input: MicroserviceInput<
      ShippingServiceInputMapper<ShippingServiceSubject.ShippingMethodAvailable>
    >,
  ): Observable<ShippingServiceOutputMapper<ShippingServiceSubject.ShippingMethodAvailable>>;
}
