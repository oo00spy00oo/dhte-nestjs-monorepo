import { FnsServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import { FnsServiceFindUserResponseInput } from '../../inputs/fns';
import { FnsServiceUserResponseOutput } from '../../outputs/fns';

export interface FnsServiceSubjectMapper {
  [FnsServiceSubject.FindUserResponse]: {
    input: FnsServiceFindUserResponseInput;
    output: FnsServiceUserResponseOutput;
  };
}

export type FnsServiceInputMapper<T extends FnsServiceSubject> =
  FnsServiceSubjectMapper[T][KeyMapper.Input];
export type FnsServiceOutputMapper<T extends FnsServiceSubject> =
  FnsServiceSubjectMapper[T][KeyMapper.Output];
