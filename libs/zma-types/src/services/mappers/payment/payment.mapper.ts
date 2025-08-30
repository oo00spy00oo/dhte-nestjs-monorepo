import { PaymentServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import {
  PaymentServiceCreatePaymentSubscriptionInput,
  PaymentServiceIpnInput,
} from '../../inputs/payment';
import {
  PaymentServiceCreatePaymentOutput,
  PaymentServiceMomoIpnOutput,
  PaymentServiceVnpayIpnOutput,
} from '../../outputs/payment';

export interface PaymentServiceSubjectMapper {
  [PaymentServiceSubject.HandleMomoPaymentIpn]: {
    input: PaymentServiceIpnInput;
    output: PaymentServiceMomoIpnOutput;
  };
  [PaymentServiceSubject.HandleVnpayPaymentIpn]: {
    input: PaymentServiceIpnInput;
    output: PaymentServiceVnpayIpnOutput;
  };
  [PaymentServiceSubject.CreatePaymentSubscription]: {
    input: PaymentServiceCreatePaymentSubscriptionInput;
    output: PaymentServiceCreatePaymentOutput;
  };
}

export type PaymentServiceInputMapper<T extends PaymentServiceSubject> =
  PaymentServiceSubjectMapper[T][KeyMapper.Input];
export type PaymentServiceOutputMapper<T extends PaymentServiceSubject> =
  PaymentServiceSubjectMapper[T][KeyMapper.Output];
