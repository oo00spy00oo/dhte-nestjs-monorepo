import { CheckinServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import {
  CheckinServiceGpsCheckinInput,
  CheckinServiceImageCheckinInput,
  CheckinServiceQrCodeCheckinInput,
  CheckinServiceWifiCheckinInput,
} from '../../inputs/checkin';
import { CheckinServiceStatusOutput } from '../../outputs/checkin';

export interface CheckinServiceMapper {
  [CheckinServiceSubject.CheckinByGps]: {
    [KeyMapper.Input]: CheckinServiceGpsCheckinInput;
    [KeyMapper.Output]: CheckinServiceStatusOutput;
  };
  [CheckinServiceSubject.CheckinByQrCode]: {
    [KeyMapper.Input]: CheckinServiceQrCodeCheckinInput;
    [KeyMapper.Output]: CheckinServiceStatusOutput;
  };
  [CheckinServiceSubject.CheckinByImage]: {
    [KeyMapper.Input]: CheckinServiceImageCheckinInput;
    [KeyMapper.Output]: CheckinServiceStatusOutput;
  };
  [CheckinServiceSubject.CheckinByWifi]: {
    [KeyMapper.Input]: CheckinServiceWifiCheckinInput;
    [KeyMapper.Output]: CheckinServiceStatusOutput;
  };
}

export type CheckinServiceInputMapper<T extends CheckinServiceSubject> =
  CheckinServiceMapper[T][KeyMapper.Input];
export type CheckinServiceOutputMapper<T extends CheckinServiceSubject> =
  CheckinServiceMapper[T][KeyMapper.Output];
