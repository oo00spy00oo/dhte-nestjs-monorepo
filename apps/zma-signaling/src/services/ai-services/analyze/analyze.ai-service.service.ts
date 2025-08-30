import { Inject, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

import { appConfiguration } from '../../../configuration';
import { AiServiceTranslateInput } from '../../../core/inputs';
import { AiServiceTranslateOutput } from '../../../core/outputs';

@Injectable()
export class AnalyzeAiService {
  private readonly logger = new Logger(AnalyzeAiService.name);
  private readonly DEFAULT_TIMEOUT = 300_000; // 5 minutes in milliseconds
  constructor(
    @Inject('APP_CONFIG') private readonly appConfig: ReturnType<typeof appConfiguration>,
  ) {}

  private async requestGraphQL<T>(
    query: string,
    variables: Record<string, unknown>,
    timeout = this.DEFAULT_TIMEOUT,
  ): Promise<T> {
    const endpoint = this.appConfig.analyze.speech.url;

    try {
      const { data } = await axios.post(
        endpoint,
        { query, variables },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout,
        },
      );

      if (data.errors) {
        this.logger.error('GraphQL errors:', data.errors);
        throw new Error(JSON.stringify(data.errors));
      }

      return data.data as T;
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        this.logger.error(`GraphQL request timed out after ${timeout} ms`);
      }
      this.logger.error(
        'GraphQL request failed:',
        axios.isAxiosError(error) ? error.response?.data : error,
      );
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  async translateText(input: AiServiceTranslateInput): Promise<AiServiceTranslateOutput> {
    const query = `
      query ($input: OmniAiServiceTranslateInput!) {
        omniAiServiceTranslate(input: $input) {
          message
        }
      }
    `;
    const result = await this.requestGraphQL<{ omniAiServiceTranslate: AiServiceTranslateOutput }>(
      query,
      { input },
    );
    return result.omniAiServiceTranslate;
  }
}
