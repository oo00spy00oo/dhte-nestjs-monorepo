import { MicroserviceInput, OrderServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  OrderServiceInputMapper,
  OrderServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/order';
import { Observable } from 'rxjs';

export interface OrderService {
  orderServiceDelete(
    input: MicroserviceInput<OrderServiceInputMapper<OrderServiceSubject.Delete>>,
  ): Observable<OrderServiceOutputMapper<OrderServiceSubject.Delete>>;

  orderServiceGetById(
    input: MicroserviceInput<OrderServiceInputMapper<OrderServiceSubject.GetById>>,
  ): Observable<OrderServiceOutputMapper<OrderServiceSubject.GetById>>;

  orderServiceUpdateStatus(
    input: MicroserviceInput<OrderServiceInputMapper<OrderServiceSubject.UpdateStatus>>,
  ): Observable<OrderServiceOutputMapper<OrderServiceSubject.UpdateStatus>>;
}
