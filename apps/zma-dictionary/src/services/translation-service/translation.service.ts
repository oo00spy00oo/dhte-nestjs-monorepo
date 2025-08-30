import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { appConfiguration } from '../../configuration';

@Injectable()
export class TranslationService {
  private readonly appConfig: ReturnType<typeof appConfiguration>;
  private readonly logger = new Logger(TranslationService.name);
  constructor(private readonly configService: ConfigService) {
    this.appConfig = appConfiguration(this.configService);
  }

  async translateText({
    text,
    targetLanguage = 'Vietnamese',
  }: {
    text: string;
    targetLanguage?: string;
  }): Promise<string | null> {
    try {
      const url = this.appConfig.analyze.speech.url;

      const query = `
      query Translate($input: OmniAiServiceTranslateInput!) {
        omniAiServiceTranslate(input: $input) {
          message
        }
      }
    `;

      const variables = {
        input: {
          message: text,
          language: targetLanguage,
        },
      };

      const headers = {
        'Content-Type': 'application/json',
      };

      const response = await axios.post(
        url,
        {
          query,
          variables,
        },
        { headers },
      );

      return response.data?.data?.omniAiServiceTranslate?.message;
    } catch (error) {
      this.logger.error('Error translating text:', error);
      return null;
    }
  }
}
