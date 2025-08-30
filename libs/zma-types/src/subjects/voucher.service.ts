export enum VoucherServiceSubject {
  GetVoucherById = 'voucherServiceGetVoucherById',
  GetVouchersByCampaignId = 'voucherServiceGetVouchersByCampaignId',
  GetVoucherTypeById = 'voucherServiceGetVoucherTypeById',
  IssueVoucher = 'voucherServiceIssueVoucher',
  ValidateAndApplyVoucher = 'voucherServiceValidateAndApplyVoucher',
  IncrementVoucherTypeRedemptionCount = 'voucherServiceIncrementVoucherTypeRedemptionCount',
  RedeemVouchers = 'voucherServiceRedeemVouchers',
  RollbackVouchers = 'voucherServiceRollbackVouchers',
}
