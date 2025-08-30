import { MicroserviceInput, InventoryServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  InventoryServiceInputMapper,
  InventoryServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/inventory';
import { Observable } from 'rxjs';

export interface InventoryService {
  inventoryServiceReserveProduct(
    input: MicroserviceInput<InventoryServiceInputMapper<InventoryServiceSubject.ReserveProduct>>,
  ): Observable<InventoryServiceOutputMapper<InventoryServiceSubject.ReserveProduct>>;

  inventoryServiceReleaseProduct(
    input: MicroserviceInput<InventoryServiceInputMapper<InventoryServiceSubject.ReleaseProduct>>,
  ): Observable<InventoryServiceOutputMapper<InventoryServiceSubject.ReleaseProduct>>;

  inventoryServiceConfirmProduct(
    input: MicroserviceInput<InventoryServiceInputMapper<InventoryServiceSubject.ConfirmProduct>>,
  ): Observable<InventoryServiceOutputMapper<InventoryServiceSubject.ConfirmProduct>>;

  inventoryServiceGetStockByProductIdAndSku(
    input: MicroserviceInput<
      InventoryServiceInputMapper<InventoryServiceSubject.GetStockByProductIdAndSku>
    >,
  ): Observable<InventoryServiceOutputMapper<InventoryServiceSubject.GetStockByProductIdAndSku>>;
}
