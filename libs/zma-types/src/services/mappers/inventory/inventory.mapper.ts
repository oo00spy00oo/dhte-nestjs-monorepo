import { BooleanOutput } from '../../../common';
import { InventoryServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import {
  InventoryServiceProductIdAndSkuInput,
  InventoryServiceStockInput,
} from '../../inputs/inventory';
import { InventoryServiceStockOutput } from '../../outputs/inventory';

export interface InventoryServiceMapper {
  [InventoryServiceSubject.ReserveProduct]: {
    [KeyMapper.Input]: InventoryServiceStockInput;
    [KeyMapper.Output]: BooleanOutput;
  };
  [InventoryServiceSubject.ReleaseProduct]: {
    [KeyMapper.Input]: InventoryServiceStockInput;
    [KeyMapper.Output]: BooleanOutput;
  };
  [InventoryServiceSubject.ConfirmProduct]: {
    [KeyMapper.Input]: InventoryServiceStockInput;
    [KeyMapper.Output]: BooleanOutput;
  };
  [InventoryServiceSubject.GetStockByProductIdAndSku]: {
    [KeyMapper.Input]: InventoryServiceProductIdAndSkuInput;
    [KeyMapper.Output]: InventoryServiceStockOutput;
  };
}

export type InventoryServiceInputMapper<T extends InventoryServiceSubject> =
  InventoryServiceMapper[T][KeyMapper.Input];

export type InventoryServiceOutputMapper<T extends InventoryServiceSubject> =
  InventoryServiceMapper[T][KeyMapper.Output];
