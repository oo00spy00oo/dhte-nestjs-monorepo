import { MicroserviceInput, VoucherServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  VoucherServiceInputMapper,
  VoucherServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/voucher';
import { Observable } from 'rxjs';

export interface VoucherService {
  voucherServiceGetVoucherById(
    input: MicroserviceInput<VoucherServiceInputMapper<VoucherServiceSubject.GetVoucherById>>,
  ): Observable<VoucherServiceOutputMapper<VoucherServiceSubject.GetVoucherById>>;
  voucherServiceGetVouchersByCampaignId(
    input: MicroserviceInput<
      VoucherServiceInputMapper<VoucherServiceSubject.GetVouchersByCampaignId>
    >,
  ): Observable<VoucherServiceOutputMapper<VoucherServiceSubject.GetVouchersByCampaignId>>;
  voucherServiceGetVoucherTypeById(
    input: MicroserviceInput<VoucherServiceInputMapper<VoucherServiceSubject.GetVoucherTypeById>>,
  ): Observable<VoucherServiceOutputMapper<VoucherServiceSubject.GetVoucherTypeById>>;
  voucherServiceIssueVoucher(
    input: MicroserviceInput<VoucherServiceInputMapper<VoucherServiceSubject.IssueVoucher>>,
  ): Observable<VoucherServiceOutputMapper<VoucherServiceSubject.IssueVoucher>>;
  voucherServiceValidateAndApplyVoucher(
    input: MicroserviceInput<
      VoucherServiceInputMapper<VoucherServiceSubject.ValidateAndApplyVoucher>
    >,
  ): Observable<VoucherServiceOutputMapper<VoucherServiceSubject.ValidateAndApplyVoucher>>;
  voucherServiceIncrementVoucherTypeRedemptionCount(
    input: MicroserviceInput<
      VoucherServiceInputMapper<VoucherServiceSubject.IncrementVoucherTypeRedemptionCount>
    >,
  ): Observable<
    VoucherServiceOutputMapper<VoucherServiceSubject.IncrementVoucherTypeRedemptionCount>
  >;
  voucherServiceRedeemVouchers(
    input: MicroserviceInput<VoucherServiceInputMapper<VoucherServiceSubject.RedeemVouchers>>,
  ): Observable<VoucherServiceOutputMapper<VoucherServiceSubject.RedeemVouchers>>;
  voucherServiceRollbackVouchers(
    input: MicroserviceInput<VoucherServiceInputMapper<VoucherServiceSubject.RollbackVouchers>>,
  ): Observable<VoucherServiceOutputMapper<VoucherServiceSubject.RollbackVouchers>>;
}
