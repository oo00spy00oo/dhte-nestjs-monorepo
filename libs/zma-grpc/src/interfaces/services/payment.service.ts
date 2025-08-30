import { MicroserviceInput, PaymentServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  PaymentServiceInputMapper,
  PaymentServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/payment';
import { Observable } from 'rxjs';

export interface PaymentService {
  paymentServiceHandleMomoIpn(
    input: MicroserviceInput<PaymentServiceInputMapper<PaymentServiceSubject.HandleMomoPaymentIpn>>,
  ): Observable<PaymentServiceOutputMapper<PaymentServiceSubject.HandleMomoPaymentIpn>>;
  paymentServiceHandleVnpayIpn(
    input: MicroserviceInput<
      PaymentServiceInputMapper<PaymentServiceSubject.HandleVnpayPaymentIpn>
    >,
  ): Observable<PaymentServiceOutputMapper<PaymentServiceSubject.HandleVnpayPaymentIpn>>;
  paymentServiceCreatePaymentSubscription(
    input: MicroserviceInput<
      PaymentServiceInputMapper<PaymentServiceSubject.CreatePaymentSubscription>
    >,
  ): Observable<PaymentServiceOutputMapper<PaymentServiceSubject.CreatePaymentSubscription>>;
}
