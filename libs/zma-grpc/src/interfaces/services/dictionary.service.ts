import { MicroserviceInput, DictionaryServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  DictionaryServiceInputMapper,
  DictionaryServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/dictionary';
import { Observable } from 'rxjs';

export interface DictionaryService {
  dictionaryServiceGetDictionary(
    input: MicroserviceInput<DictionaryServiceInputMapper<DictionaryServiceSubject.GetDictionary>>,
  ): Observable<DictionaryServiceOutputMapper<DictionaryServiceSubject.GetDictionary>>;
  dictionaryServiceGetDictionaries(
    input: MicroserviceInput<
      DictionaryServiceInputMapper<DictionaryServiceSubject.GetDictionaries>
    >,
  ): Observable<DictionaryServiceOutputMapper<DictionaryServiceSubject.GetDictionaries>>;
  dictionaryServiceSearchDictionaryByWordAndPos(
    input: MicroserviceInput<
      DictionaryServiceInputMapper<DictionaryServiceSubject.SearchDictionaryByWordAndPos>
    >,
  ): Observable<
    DictionaryServiceOutputMapper<DictionaryServiceSubject.SearchDictionaryByWordAndPos>
  >;
  dictionaryServiceSearchDictionariesByWordAndPos(
    input: MicroserviceInput<
      DictionaryServiceInputMapper<DictionaryServiceSubject.SearchDictionariesByWordAndPos>
    >,
  ): Observable<
    DictionaryServiceOutputMapper<DictionaryServiceSubject.SearchDictionariesByWordAndPos>
  >;
  dictionaryServiceSearchDictionaries(
    input: MicroserviceInput<
      DictionaryServiceInputMapper<DictionaryServiceSubject.SearchDictionaries>
    >,
  ): Observable<DictionaryServiceOutputMapper<DictionaryServiceSubject.SearchDictionaries>>;
}
