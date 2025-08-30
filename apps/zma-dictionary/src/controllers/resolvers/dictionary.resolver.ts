import { Args, Query, Resolver } from '@nestjs/graphql';
import { Pagination } from '@zma-nestjs-monorepo/zma-types';
import {
  DictionaryServiceSearchDictionariesInput,
  DictionaryServiceSearchManyByWordAndPosInput,
} from '@zma-nestjs-monorepo/zma-types/inputs/dictionary';
import { DictionaryServiceDictionaryGqlOutput } from '@zma-nestjs-monorepo/zma-types/outputs/dictionary';

import { DictionaryUseCase } from '../../use-cases/dictionary/dictionary.use-case';

@Resolver()
export class DictionaryResolver {
  constructor(private useCase: DictionaryUseCase) {}

  @Query(() => DictionaryServiceDictionaryGqlOutput)
  async dictionaryServiceDictionary(
    @Args('id') id: string,
  ): Promise<DictionaryServiceDictionaryGqlOutput> {
    return this.useCase.getDictionary(id);
  }

  @Query(() => [DictionaryServiceDictionaryGqlOutput])
  async dictionaryServiceDictionaries(
    @Args('ids', { type: () => [String] }) ids: string[],
    @Args('pagination') pagination: Pagination,
  ): Promise<DictionaryServiceDictionaryGqlOutput[]> {
    return this.useCase.getDictionaries({ ids, pagination });
  }

  @Query(() => [DictionaryServiceDictionaryGqlOutput])
  async dictionaryServiceAllDictionaries(
    @Args('input') input: Pagination,
  ): Promise<DictionaryServiceDictionaryGqlOutput[]> {
    return this.useCase.getAllDictionaries(input);
  }

  @Query(() => [DictionaryServiceDictionaryGqlOutput])
  async dictionaryServiceSearchDictionaries(
    @Args('input') input: DictionaryServiceSearchDictionariesInput,
    @Args('pagination') pagination: Pagination,
  ): Promise<DictionaryServiceDictionaryGqlOutput[]> {
    return this.useCase.searchDictionaries({ input, pagination });
  }

  @Query(() => [DictionaryServiceDictionaryGqlOutput])
  async dictionaryServiceSearchDictionariesByWordAndPos(
    @Args('input') input: DictionaryServiceSearchManyByWordAndPosInput,
    @Args('pagination') pagination: Pagination,
  ): Promise<DictionaryServiceDictionaryGqlOutput[]> {
    return this.useCase.searchDictionariesByWordAndPos({ input, pagination });
  }
}
