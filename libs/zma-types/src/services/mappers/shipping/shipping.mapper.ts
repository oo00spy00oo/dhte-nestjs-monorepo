import { ShippingServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import { ShippingServiceShippingMethodAvailableInput } from '../../inputs/shipping';
import { ShippingServiceShippingMethod } from '../../outputs/shipping';

export interface ShippingServiceSubjectMapper {
  [ShippingServiceSubject.ShippingMethodAvailable]: {
    input: ShippingServiceShippingMethodAvailableInput;
    output: {
      data: ShippingServiceShippingMethod[];
    };
  };
}

export type ShippingServiceInputMapper<T extends ShippingServiceSubject> =
  ShippingServiceSubjectMapper[T][KeyMapper.Input];
export type ShippingServiceOutputMapper<T extends ShippingServiceSubject> =
  ShippingServiceSubjectMapper[T][KeyMapper.Output];
