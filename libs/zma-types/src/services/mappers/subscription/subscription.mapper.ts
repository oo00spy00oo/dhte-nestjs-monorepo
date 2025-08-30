import { SubscriptionServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import { SubscriptionServiceGetSubscriptionStatusByIdInput } from '../../inputs/subscription';
import { SubscriptionServiceGetSubscriptionStatusByIdOutput } from '../../outputs/subscription';
export interface SubscriptionServiceSubjectMapper {
  [SubscriptionServiceSubject.GetSubscriptionByIdAndTenantId]: {
    input: SubscriptionServiceGetSubscriptionStatusByIdInput;
    output: SubscriptionServiceGetSubscriptionStatusByIdOutput;
  };
}

export type SubscriptionServiceInputMapper<T extends SubscriptionServiceSubject> =
  SubscriptionServiceSubjectMapper[T][KeyMapper.Input];
export type SubscriptionServiceOutputMapper<T extends SubscriptionServiceSubject> =
  SubscriptionServiceSubjectMapper[T][KeyMapper.Output];
