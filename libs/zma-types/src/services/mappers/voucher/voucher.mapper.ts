import { VoucherServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import {
  VoucherServiceGetVoucherByIdInput,
  VoucherServiceGetVouchersByCampaignIdInput,
  VoucherServiceGetVoucherTypeByIdInput,
  VoucherServiceIncrementVoucherTypeRedemptionCountInput,
  VoucherServiceIssueVoucherInput,
  VoucherServiceRedeemVoucherInput,
  VoucherServiceRollbackVoucherByOrderIdInput,
  VoucherServiceValidateAndApplyVoucherInput,
} from '../../inputs/voucher';
import {
  VoucherServiceIncrementVoucherTypeRedemptionCountOutput,
  VoucherServiceRedeemVoucherOutput,
  VoucherServiceRollbackVoucherByOrderIdOutput,
  VoucherServiceValidateAndApplyVoucherOutput,
  VoucherServiceVoucherOutput,
  VoucherServiceVoucherTypeOutput,
} from '../../models/voucher';

interface VoucherServiceMapper {
  [VoucherServiceSubject.GetVoucherById]: {
    [KeyMapper.Input]: VoucherServiceGetVoucherByIdInput;
    [KeyMapper.Output]: VoucherServiceVoucherOutput;
  };
  [VoucherServiceSubject.GetVouchersByCampaignId]: {
    [KeyMapper.Input]: VoucherServiceGetVouchersByCampaignIdInput;
    [KeyMapper.Output]: {
      data: VoucherServiceVoucherOutput[];
    };
  };
  [VoucherServiceSubject.GetVoucherTypeById]: {
    [KeyMapper.Input]: VoucherServiceGetVoucherTypeByIdInput;
    [KeyMapper.Output]: VoucherServiceVoucherTypeOutput;
  };
  [VoucherServiceSubject.IssueVoucher]: {
    [KeyMapper.Input]: VoucherServiceIssueVoucherInput;
    [KeyMapper.Output]: VoucherServiceVoucherOutput;
  };
  [VoucherServiceSubject.ValidateAndApplyVoucher]: {
    [KeyMapper.Input]: VoucherServiceValidateAndApplyVoucherInput;
    [KeyMapper.Output]: VoucherServiceValidateAndApplyVoucherOutput;
  };
  [VoucherServiceSubject.IncrementVoucherTypeRedemptionCount]: {
    [KeyMapper.Input]: VoucherServiceIncrementVoucherTypeRedemptionCountInput;
    [KeyMapper.Output]: VoucherServiceIncrementVoucherTypeRedemptionCountOutput;
  };
  [VoucherServiceSubject.RedeemVouchers]: {
    [KeyMapper.Input]: VoucherServiceRedeemVoucherInput;
    [KeyMapper.Output]: VoucherServiceRedeemVoucherOutput;
  };
  [VoucherServiceSubject.RollbackVouchers]: {
    [KeyMapper.Input]: VoucherServiceRollbackVoucherByOrderIdInput;
    [KeyMapper.Output]: VoucherServiceRollbackVoucherByOrderIdOutput;
  };
}

export type VoucherServiceInputMapper<T extends keyof VoucherServiceMapper> =
  VoucherServiceMapper[T][KeyMapper.Input];

export type VoucherServiceOutputMapper<T extends keyof VoucherServiceMapper> =
  VoucherServiceMapper[T][KeyMapper.Output];
