import { MicroserviceInput, CartServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  CartServiceInputMapper,
  CartServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/cart';
import { Observable } from 'rxjs';

export interface CartService {
  cartServiceDelete(
    input: MicroserviceInput<CartServiceInputMapper<CartServiceSubject.Delete>>,
  ): Observable<CartServiceOutputMapper<CartServiceSubject.Delete>>;

  cartServiceDeleteByCartIds(
    input: MicroserviceInput<CartServiceInputMapper<CartServiceSubject.Deletes>>,
  ): Observable<CartServiceOutputMapper<CartServiceSubject.Deletes>>;

  cartServiceGetByIds(
    input: MicroserviceInput<CartServiceInputMapper<CartServiceSubject.GetByIds>>,
  ): Observable<CartServiceOutputMapper<CartServiceSubject.GetByIds>>;
}
