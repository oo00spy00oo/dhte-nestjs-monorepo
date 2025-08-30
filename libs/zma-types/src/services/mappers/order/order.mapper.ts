import { BooleanOutput } from '../../../common';
import { KafkaTopic } from '../../../enums';
import { OrderServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import { OrderServiceUserOrderedEventKafkaInput } from '../../inputs/kafka';
import { OrderServiceDeleteInput, OrderServiceUpdateStatusInput } from '../../inputs/order';
import { OrderServiceOrder } from '../../outputs/order';

export interface OrderServiceSubjectMapper {
  [OrderServiceSubject.Delete]: {
    input: OrderServiceDeleteInput;
    output: BooleanOutput;
  };
  [OrderServiceSubject.UpdateStatus]: {
    input: OrderServiceUpdateStatusInput;
    output: BooleanOutput;
  };
  [OrderServiceSubject.GetById]: {
    input: string;
    output: OrderServiceOrder;
  };
}

export type OrderServiceInputMapper<T extends OrderServiceSubject> =
  OrderServiceSubjectMapper[T][KeyMapper.Input];
export type OrderServiceOutputMapper<T extends OrderServiceSubject> =
  OrderServiceSubjectMapper[T][KeyMapper.Output];

export interface OrderServiceEventMapper {
  [KafkaTopic.OrderCreatedEventTopic]: {
    input: OrderServiceUserOrderedEventKafkaInput;
    output: void;
  };
}

export type OrderServiceEventInputMapper<T extends keyof OrderServiceEventMapper> =
  OrderServiceEventMapper[T][KeyMapper.Input];
export type OrderServiceEventOutputMapper<T extends keyof OrderServiceEventMapper> =
  OrderServiceEventMapper[T][KeyMapper.Output];
