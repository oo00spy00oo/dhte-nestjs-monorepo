import { BooleanOutput, FindByMultipleIdsAndUserIdInput } from '../../../common';
import { CartServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import { CartServiceDeleteInput, CartServiceDeleteMultipleInput } from '../../inputs/cart';
import { CartServiceCart } from '../../outputs/cart';

export interface CartServiceSubjectMapper {
  [CartServiceSubject.Delete]: {
    input: CartServiceDeleteInput;
    output: BooleanOutput;
  };
  [CartServiceSubject.Deletes]: {
    input: CartServiceDeleteMultipleInput;
    output: BooleanOutput;
  };
  [CartServiceSubject.GetByIds]: {
    input: FindByMultipleIdsAndUserIdInput;
    output: {
      data: CartServiceCart[];
    };
  };
}

export type CartServiceInputMapper<T extends CartServiceSubject> =
  CartServiceSubjectMapper[T][KeyMapper.Input];
export type CartServiceOutputMapper<T extends CartServiceSubject> =
  CartServiceSubjectMapper[T][KeyMapper.Output];
