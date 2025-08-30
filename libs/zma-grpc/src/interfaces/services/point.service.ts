import { MicroserviceInput, PointServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  PointServiceInputMapper,
  PointServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/point';
import { Observable } from 'rxjs';

export interface PointService {
  pointServiceCreatePointBalanceProfile(
    input: MicroserviceInput<
      PointServiceInputMapper<PointServiceSubject.CreatePointBalanceProfile>
    >,
  ): Observable<PointServiceOutputMapper<PointServiceSubject.CreatePointBalanceProfile>>;
  pointServiceAddPointsForProfile(
    input: MicroserviceInput<PointServiceInputMapper<PointServiceSubject.AddPointsForProfile>>,
  ): Observable<PointServiceOutputMapper<PointServiceSubject.AddPointsForProfile>>;
  pointServiceGetPointBalanceByUserId(
    input: MicroserviceInput<PointServiceInputMapper<PointServiceSubject.GetPointBalanceByUserId>>,
  ): Observable<PointServiceOutputMapper<PointServiceSubject.GetPointBalanceByUserId>>;
  pointServiceCountPointTransactionsByUserId(
    input: MicroserviceInput<
      PointServiceInputMapper<PointServiceSubject.CountPointTransactionsByUserId>
    >,
  ): Observable<PointServiceOutputMapper<PointServiceSubject.CountPointTransactionsByUserId>>;
}
