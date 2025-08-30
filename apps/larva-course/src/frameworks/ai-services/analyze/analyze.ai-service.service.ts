import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import {
  AiServiceLipSyncInput,
  AiServiceText2SpeechInput,
  AiServiceTranslateInput,
  AnalyzeInput,
} from '../../../core/inputs/analyze-ai.input';
import {
  LarvaCourseServiceAnalyzeCompareWordOutput,
  LarvaCourseServiceAnalyzeWordPhoneticsOutput,
  LarvaCourseServiceAnalyzeSentenceDetailOutput,
  LarvaCourseServiceText2SpeechOutput,
  LarvaCourseServiceLipSyncOutput,
  LarvaCourseServiceTranslateOutput,
} from '../../../core/outputs/analyze.output';

@Injectable()
export class AnalyzeAiService {
  private readonly logger = new Logger(AnalyzeAiService.name);
  private readonly TIMEOUT = 300_000; // 5 minutes

  constructor(private configService: ConfigService) {}

  async analyzeCompareWord({
    input,
  }: {
    input: AnalyzeInput;
  }): Promise<LarvaCourseServiceAnalyzeCompareWordOutput[]> {
    const endpoint = this.configService.get('ANALYZE_SPEECH_URL');
    try {
      const response = await axios({
        url: endpoint,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          query: `
            query AnalyzeCompareWord($input: OmniAiServiceAnalyzeCompareWordInput!) {
              omniAiServiceAnalyzeCompareWord(input: $input) {
                expected
                status
                value
              }
            }
          `,
          variables: {
            input: {
              originalWord: input.originalText,
              comparisonWord: input.comparisonText,
            },
          },
        },
      });
      if (response.data.errors) {
        console.error('GraphQL errors:', response.data.errors);
        // return null;
        throw new Error('GraphQL errors: ' + JSON.stringify(response.data.errors));
      }
      return response.data.data
        .omniAiServiceAnalyzeCompareWord as LarvaCourseServiceAnalyzeCompareWordOutput[];
    } catch (error) {
      console.error('Error analyzing compare word:', error.response?.data || error.message);
      // return null;
      throw error instanceof Error
        ? error
        : new Error('Error analyzing compare word: ' + JSON.stringify(error));
    }
  }

  async analyzeWordPhonetics({
    input,
  }: {
    input: AnalyzeInput;
  }): Promise<LarvaCourseServiceAnalyzeWordPhoneticsOutput[]> {
    const endpoint = this.configService.get('ANALYZE_SPEECH_URL');
    try {
      const response = await axios({
        url: endpoint,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          query: `
            query AnalyzeWordPhonetics($input: OmniAiServiceAnalyzeWordPhoneticsInput!) {
              omniAiServiceDeepAnalyzeWordPhonetics(input: $input) {
                expected
                expectedGrapheme
                grapheme
                status
                tips
                value
              }
            }
          `,
          variables: {
            input: {
              originalWord: input.originalText,
              comparisonWord: input.comparisonText,
            },
          },
        },
      });
      if (response.data.errors) {
        console.error('GraphQL errors:', response.data.errors);
        // return null;
        throw new Error('GraphQL errors: ' + JSON.stringify(response.data.errors));
      }
      return response.data.data
        .omniAiServiceDeepAnalyzeWordPhonetics as LarvaCourseServiceAnalyzeWordPhoneticsOutput[];
    } catch (error) {
      console.error('Error analyzing word:', error.response?.data || error.message);
      // return null;
      throw error instanceof Error
        ? error
        : new Error('Error analyzing word: ' + JSON.stringify(error));
    }
  }

  async analyzeSentence({
    input,
  }: {
    input: AnalyzeInput;
  }): Promise<LarvaCourseServiceAnalyzeSentenceDetailOutput[]> {
    const endpoint = this.configService.get('ANALYZE_SPEECH_URL');
    try {
      const response = await axios({
        url: endpoint,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          query: `
            query AnalyzeSentence($input: OmniAiServiceAnalyzeCompareSentenceInput!) {
              omniAiServiceDeepAnalyzeSentence(input: $input) {
                comparisonWord
                detailPhonetics {
                  expected
                  expectedGrapheme
                  grapheme
                  status
                  tips
                  value
                }
                detailWords {
                  expected
                  status
                  value
                }
                originalWord
                status
              }
            }
          `,
          variables: {
            input: {
              originalSentence: input.originalText,
              comparisonSentence: input.comparisonText,
            },
          },
        },
      });
      if (response.data.errors) {
        console.error('GraphQL errors:', response.data.errors);
        // return null;
        throw new Error('GraphQL errors: ' + JSON.stringify(response.data.errors));
      }

      return response.data.data
        .omniAiServiceDeepAnalyzeSentence as LarvaCourseServiceAnalyzeSentenceDetailOutput[];
    } catch (error) {
      console.error('Error analyzing sentence:', error.response?.data || error.message);
      // return null;
      throw error instanceof Error
        ? error
        : new Error('Error analyzing sentence: ' + JSON.stringify(error));
    }
  }

  private async requestGraphQL<T>(
    query: string,
    variables: Record<string, unknown>,
    timeout = this.TIMEOUT,
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
        this.logger.error('GraphQL errors:', JSON.stringify(data.errors));
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

  async generateTextToSpeech(input: AiServiceText2SpeechInput) {
    const query = `
      query ($input: OmniAiServiceTTSInput!) {
        omniAiServiceText2Speech(input: $input) {
          url
        }
      }
    `;
    const variables = { input };
    const result = await this.requestGraphQL<{
      omniAiServiceText2Speech: LarvaCourseServiceText2SpeechOutput;
    }>(query, variables);
    return result.omniAiServiceText2Speech;
  }

  async translateText(input: AiServiceTranslateInput) {
    const query = `
      query ($input: OmniAiServiceTranslateInput!) {
        omniAiServiceTranslate(input: $input) {
          message
        }
      }
    `;
    const variables = { input };
    const result = await this.requestGraphQL<{
      omniAiServiceTranslate: LarvaCourseServiceTranslateOutput;
    }>(query, variables);
    return result.omniAiServiceTranslate;
  }

  async generateLipSync(input: AiServiceLipSyncInput) {
    const query = `
      query ($input: OmniAiServiceLipSyncInput!) {
        omniAiServiceLipSync(input: $input) {
          url
        }
      }
    `;
    const variables = { input };
    const result = await this.requestGraphQL<{
      omniAiServiceLipSync: LarvaCourseServiceLipSyncOutput;
    }>(query, variables);
    return result.omniAiServiceLipSync;
  }
}
