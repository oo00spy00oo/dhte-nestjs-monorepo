import { ProductServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import { MicroserviceInput } from '@zma-nestjs-monorepo/zma-types';
import {
  ProductServiceInputMapper,
  ProductServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/product';
import { Observable } from 'rxjs';

export interface ProductService {
  productServiceGetProductById(
    input: MicroserviceInput<ProductServiceInputMapper<ProductServiceSubject.GetProductById>>,
  ): Observable<ProductServiceOutputMapper<ProductServiceSubject.GetProductById>>;
}
