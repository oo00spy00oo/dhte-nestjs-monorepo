import { MicroserviceInput } from '@zma-nestjs-monorepo/zma-types';
import { CheckinServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  CheckinServiceInputMapper,
  CheckinServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/checkin';
import { Observable } from 'rxjs';

export interface CheckinService {
  checkinServiceCheckinByGps(
    input: MicroserviceInput<CheckinServiceInputMapper<CheckinServiceSubject.CheckinByGps>>,
  ): Observable<CheckinServiceOutputMapper<CheckinServiceSubject.CheckinByGps>>;

  checkinServiceCheckinByWifi(
    input: MicroserviceInput<CheckinServiceInputMapper<CheckinServiceSubject.CheckinByWifi>>,
  ): Observable<CheckinServiceOutputMapper<CheckinServiceSubject.CheckinByWifi>>;

  checkinServiceCheckinByImage(
    input: MicroserviceInput<CheckinServiceInputMapper<CheckinServiceSubject.CheckinByImage>>,
  ): Observable<CheckinServiceOutputMapper<CheckinServiceSubject.CheckinByImage>>;

  checkinServiceCheckinByQrCode(
    input: MicroserviceInput<CheckinServiceInputMapper<CheckinServiceSubject.CheckinByQrCode>>,
  ): Observable<CheckinServiceOutputMapper<CheckinServiceSubject.CheckinByQrCode>>;
}
