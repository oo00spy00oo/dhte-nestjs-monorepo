import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MeilisearchOptions,
  MeilisearchOptionsFactory,
} from '@passiontech-global/nestjs-meilisearch';

@Injectable()
export class MeilisearchConfigService implements MeilisearchOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMeilisearchOptions(): MeilisearchOptions {
    const host = this.configService.get<string>('MEILISEARCH_URL');
    const apiKey = this.configService.get<string>('MEILISEARCH_API_KEY');
    if (!host) {
      throw new Error('Meilisearch host configuration is missing');
    }
    if (!apiKey) {
      throw new Error('Meilisearch api key configuration is missing');
    }
    return {
      host,
      apiKey,
    } as MeilisearchOptions;
  }
}
