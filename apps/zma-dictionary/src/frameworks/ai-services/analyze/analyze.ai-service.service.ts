import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import {
  AiServiceLipSyncInput,
  AiServiceText2SpeechInput,
  AiServiceTranslateInput,
} from '../../../core/inputs/analyze-ai.input';
import {
  AiServiceText2SpeechOutput,
  AiServiceLipSyncOutput,
  AiServiceTranslateOutput,
} from '../../../core/outputs/analyze-ai.output';

@Injectable()
export class AnalyzeAiService {
  private readonly logger = new Logger(AnalyzeAiService.name);
  private readonly DEFAULT_TIMEOUT = 300_000; // 5 minutes in milliseconds
  constructor(private configService: ConfigService) {}

  private async requestGraphQL<T>(
    query: string,
    variables: Record<string, unknown>,
    timeout = this.DEFAULT_TIMEOUT,
  ): Promise<T> {
    const endpoint = this.configService.get<string>('ANALYZE_SPEECH_URL');

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

  async generateTextToSpeech(
    input: AiServiceText2SpeechInput,
  ): Promise<AiServiceText2SpeechOutput> {
    const query = `
      query ($input: OmniAiServiceTTSInput!) {
        omniAiServiceText2Speech(input: $input) {
          url
        }
      }
    `;
    const result = await this.requestGraphQL<{
      omniAiServiceText2Speech: AiServiceText2SpeechOutput;
    }>(query, { input });
    return result.omniAiServiceText2Speech;
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

  async generateLipSync(input: AiServiceLipSyncInput): Promise<AiServiceLipSyncOutput> {
    const query = `
      query ($input: OmniAiServiceLipSyncInput!) {
        omniAiServiceLipSync(input: $input) {
          url
        }
      }
    `;
    const result = await this.requestGraphQL<{ omniAiServiceLipSync: AiServiceLipSyncOutput }>(
      query,
      { input },
    );
    return result.omniAiServiceLipSync;
  }
}
