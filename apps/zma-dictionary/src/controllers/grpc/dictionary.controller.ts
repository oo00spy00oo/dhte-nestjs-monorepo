import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import {
  MicroserviceInput,
  ServiceName,
  DictionaryServiceSubject,
} from '@zma-nestjs-monorepo/zma-types';
import {
  DictionaryServiceInputMapper,
  DictionaryServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/dictionary';

import { DictionaryUseCase } from '../../use-cases/dictionary/dictionary.use-case';

@Controller()
export class DictionaryGrpcController {
  private logger = new Logger(DictionaryGrpcController.name);
  constructor(private readonly useCase: DictionaryUseCase) {}

  @GrpcMethod(ServiceName.DICTIONARY, DictionaryServiceSubject.GetDictionary)
  async getDictionary(
    @Payload()
    input: MicroserviceInput<DictionaryServiceInputMapper<DictionaryServiceSubject.GetDictionary>>,
  ): Promise<DictionaryServiceOutputMapper<DictionaryServiceSubject.GetDictionary>> {
    this.logger.log(input, 'getDictionary');
    const { id } = input.data;
    const result = await this.useCase.getDictionary(id);
    return result;
  }

  @GrpcMethod(ServiceName.DICTIONARY, DictionaryServiceSubject.GetDictionaries)
  async getDictionaries(
    @Payload()
    input: MicroserviceInput<
      DictionaryServiceInputMapper<DictionaryServiceSubject.GetDictionaries>
    >,
  ): Promise<DictionaryServiceOutputMapper<DictionaryServiceSubject.GetDictionaries>> {
    this.logger.log(input, 'getDictionaries');
    const { ids } = input.data;
    const pagination = input.pagination || { limit: 10, skip: 0 };
    const result = await this.useCase.getDictionaries({
      ids,
      pagination,
    });
    return {
      data: result,
    };
  }

  @GrpcMethod(ServiceName.DICTIONARY, DictionaryServiceSubject.SearchDictionariesByWordAndPos)
  async searchDictionariesByWordAndPos(
    @Payload()
    input: MicroserviceInput<
      DictionaryServiceInputMapper<DictionaryServiceSubject.SearchDictionariesByWordAndPos>
    >,
  ): Promise<
    DictionaryServiceOutputMapper<DictionaryServiceSubject.SearchDictionariesByWordAndPos>
  > {
    this.logger.log(input, 'searchDictionariesByWordAndPos');
    const pagination = input.pagination || { limit: 10, skip: 0 };
    const result = await this.useCase.searchDictionariesByWordAndPos({
      input: {
        wordAndPosInputs: input.data.wordAndPosInputs,
      },
      pagination,
    });
    return {
      data: result,
    };
  }

  @GrpcMethod(ServiceName.DICTIONARY, DictionaryServiceSubject.SearchDictionaries)
  async searchDictionaries(
    @Payload()
    input: MicroserviceInput<
      DictionaryServiceInputMapper<DictionaryServiceSubject.SearchDictionaries>
    >,
  ): Promise<DictionaryServiceOutputMapper<DictionaryServiceSubject.SearchDictionaries>> {
    this.logger.log(input, 'searchDictionaries');
    const pagination = input.pagination || { limit: 10, skip: 0 };
    const result = await this.useCase.searchDictionaries({
      input: input.data,
      pagination,
    });
    return {
      data: result,
    };
  }
}
