import { KafkaTopic } from '../../../enums';
import { PointServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import { PointServiceUserPointBalanceUpdatedEventKafkaInput } from '../../inputs/kafka';
import {
  PointServiceAddPointsForProfileInput,
  PointServiceCountPointTransactionsByUserIdInput,
  PointServiceCreatePointBalanceProfileInput,
  PointServiceGetPointBalanceByUserIdInput,
} from '../../inputs/point';
import {
  PointServiceAddPointsForProfileOutput,
  PointServiceCountPointTransactionsByUserIdOutput,
  PointServicePointBalanceOutput,
} from '../../models/point';

interface PointServiceMapper {
  [PointServiceSubject.CreatePointBalanceProfile]: {
    [KeyMapper.Input]: PointServiceCreatePointBalanceProfileInput;
    [KeyMapper.Output]: PointServicePointBalanceOutput;
  };
  [PointServiceSubject.AddPointsForProfile]: {
    [KeyMapper.Input]: PointServiceAddPointsForProfileInput;
    [KeyMapper.Output]: PointServiceAddPointsForProfileOutput;
  };
  [PointServiceSubject.GetPointBalanceByUserId]: {
    [KeyMapper.Input]: PointServiceGetPointBalanceByUserIdInput;
    [KeyMapper.Output]: PointServicePointBalanceOutput;
  };
  [PointServiceSubject.CountPointTransactionsByUserId]: {
    [KeyMapper.Input]: PointServiceCountPointTransactionsByUserIdInput;
    [KeyMapper.Output]: PointServiceCountPointTransactionsByUserIdOutput;
  };
}

export type PointServiceInputMapper<T extends keyof PointServiceMapper> =
  PointServiceMapper[T][KeyMapper.Input];

export type PointServiceOutputMapper<T extends keyof PointServiceMapper> =
  PointServiceMapper[T][KeyMapper.Output];

export interface PointServiceEventMapper {
  [KafkaTopic.PointBalanceUpdatedEventTopic]: {
    input: PointServiceUserPointBalanceUpdatedEventKafkaInput;
    output: void;
  };
}

export type PointServiceEventInputMapper<T extends keyof PointServiceEventMapper> =
  PointServiceEventMapper[T][KeyMapper.Input];

export type PointServiceEventOutputMapper<T extends keyof PointServiceEventMapper> =
  PointServiceEventMapper[T][KeyMapper.Output];
