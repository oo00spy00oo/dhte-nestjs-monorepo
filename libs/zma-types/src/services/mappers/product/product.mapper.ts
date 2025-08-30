import { KafkaTopic } from '../../../enums';
import { ProductServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import {
  ProductServiceProductCreatedEventKafkaInput,
  ProductServiceProductDeletedEventKafkaInput,
} from '../../inputs/kafka';
import { ProductServiceIdInput } from '../../inputs/product';
import { ProductServiceProductOutput } from '../../outputs/product/product.output';

export interface ProductServiceMapper {
  [ProductServiceSubject.GetProductById]: {
    [KeyMapper.Input]: ProductServiceIdInput;
    [KeyMapper.Output]: ProductServiceProductOutput;
  };
}

export type ProductServiceInputMapper<T extends ProductServiceSubject> =
  ProductServiceMapper[T][KeyMapper.Input];

export type ProductServiceOutputMapper<T extends ProductServiceSubject> =
  ProductServiceMapper[T][KeyMapper.Output];

export interface ProductServiceEventMapper {
  [KafkaTopic.ProductCreatedEventTopic]: {
    [KeyMapper.Input]: ProductServiceProductCreatedEventKafkaInput;
    [KeyMapper.Output]: void;
  };
  [KafkaTopic.ProductDeletedEventTopic]: {
    [KeyMapper.Input]: ProductServiceProductDeletedEventKafkaInput;
    [KeyMapper.Output]: void;
  };
}

export type ProductServiceEventInputMapper<T extends keyof ProductServiceEventMapper> =
  ProductServiceEventMapper[T][KeyMapper.Input];
export type ProductServiceEventOutputMapper<T extends keyof ProductServiceEventMapper> =
  ProductServiceEventMapper[T][KeyMapper.Output];
