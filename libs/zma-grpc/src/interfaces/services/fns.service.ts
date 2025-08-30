import { MicroserviceInput, FnsServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  FnsServiceInputMapper,
  FnsServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/fns';
import { Observable } from 'rxjs';

export interface FnsService {
  fnsServiceFindUserResponse(
    input: MicroserviceInput<FnsServiceInputMapper<FnsServiceSubject.FindUserResponse>>,
  ): Observable<FnsServiceOutputMapper<FnsServiceSubject.FindUserResponse>>;
}
