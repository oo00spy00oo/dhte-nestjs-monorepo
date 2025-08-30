import { DictionaryServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import {
  DictionaryServiceGetDictionariesInput,
  DictionaryServiceGetDictionaryInput,
  DictionaryServiceSearchByWordAndPosInput,
  DictionaryServiceSearchDictionariesInput,
  DictionaryServiceSearchManyByWordAndPosInput,
} from '../../inputs/dictionary';
import { DictionaryServiceDictionaryOutput } from '../../outputs/dictionary';

interface DictionaryServiceMapper {
  [DictionaryServiceSubject.GetDictionary]: {
    [KeyMapper.Input]: DictionaryServiceGetDictionaryInput;
    [KeyMapper.Output]: DictionaryServiceDictionaryOutput;
  };
  [DictionaryServiceSubject.GetDictionaries]: {
    [KeyMapper.Input]: DictionaryServiceGetDictionariesInput;
    [KeyMapper.Output]: { data: DictionaryServiceDictionaryOutput[] };
  };
  [DictionaryServiceSubject.SearchDictionaryByWordAndPos]: {
    [KeyMapper.Input]: DictionaryServiceSearchByWordAndPosInput;
    [KeyMapper.Output]: DictionaryServiceDictionaryOutput;
  };
  [DictionaryServiceSubject.SearchDictionariesByWordAndPos]: {
    [KeyMapper.Input]: DictionaryServiceSearchManyByWordAndPosInput;
    [KeyMapper.Output]: { data: DictionaryServiceDictionaryOutput[] };
  };
  [DictionaryServiceSubject.SearchDictionaries]: {
    [KeyMapper.Input]: DictionaryServiceSearchDictionariesInput;
    [KeyMapper.Output]: { data: DictionaryServiceDictionaryOutput[] };
  };
}

export type DictionaryServiceInputMapper<T extends DictionaryServiceSubject> =
  DictionaryServiceMapper[T][KeyMapper.Input];

export type DictionaryServiceOutputMapper<T extends DictionaryServiceSubject> =
  DictionaryServiceMapper[T][KeyMapper.Output];
