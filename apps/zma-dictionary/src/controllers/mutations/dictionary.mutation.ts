import { Resolver } from '@nestjs/graphql';
import { Args, Mutation } from '@nestjs/graphql';
import {
  DictionaryServiceCreateDictionaryGqlInput,
  DictionaryServiceUpdateDictionaryGqlInput,
} from '@zma-nestjs-monorepo/zma-types/inputs/dictionary';

import {
  DictionaryServiceCrawlWordGqlInput,
  DictionaryServiceCrawlWordsGqlInput,
} from '../../core/inputs';
import { DictionaryServiceCrawlWordOutput } from '../../core/outputs/dictionary.output';
import { DictionaryUseCase } from '../../use-cases/dictionary/dictionary.use-case';

@Resolver()
export class DictionaryMutation {
  constructor(private useCase: DictionaryUseCase) {}

  @Mutation(() => Boolean)
  async dictionaryServiceCreateDictionary(
    @Args('input') input: DictionaryServiceCreateDictionaryGqlInput,
  ): Promise<boolean> {
    return this.useCase.createDictionary(input);
  }

  @Mutation(() => Boolean)
  async dictionaryServiceDeleteDictionaries(
    @Args('ids', { type: () => [String] }) ids: string[],
  ): Promise<boolean> {
    return this.useCase.deleteDictionaries(ids);
  }

  @Mutation(() => Boolean)
  async dictionaryServiceEnableDictionaries(
    @Args('ids', { type: () => [String] }) ids: string[],
  ): Promise<boolean> {
    return this.useCase.enableDictionaries(ids);
  }

  @Mutation(() => Boolean)
  async dictionaryServiceUpdateDictionary(
    @Args('id') id: string,
    @Args('input') input: DictionaryServiceUpdateDictionaryGqlInput,
  ): Promise<boolean> {
    return this.useCase.updateDictionary({ id, input });
  }

  // Admin only
  @Mutation(() => Boolean)
  async dictionaryServiceCrawlWord(
    @Args('input') input: DictionaryServiceCrawlWordGqlInput,
  ): Promise<boolean> {
    return this.useCase.crawlWord(input);
  }

  // Admin only
  @Mutation(() => [DictionaryServiceCrawlWordOutput])
  async dictionaryServiceCrawlWords(
    @Args('input') input: DictionaryServiceCrawlWordsGqlInput,
  ): Promise<DictionaryServiceCrawlWordOutput[]> {
    return this.useCase.crawlWords(input);
  }
}
