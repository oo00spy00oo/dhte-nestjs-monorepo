import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiServiceTranslateLanguageEnum } from '@zma-nestjs-monorepo/zma-types';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async translateText({
    targetLanguage,
    text,
  }: {
    targetLanguage: AiServiceTranslateLanguageEnum;
    text: string;
  }): Promise<string> {
    try {
      const sourceLanguague =
        targetLanguage === AiServiceTranslateLanguageEnum.VI
          ? AiServiceTranslateLanguageEnum.EN
          : AiServiceTranslateLanguageEnum.VI;
      const response = await this.client.responses.create({
        model: this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini',
        instructions: `You are an expert translator from ${sourceLanguague} to ${targetLanguage}.
        The output should be in ${targetLanguage}, do not respond with any other text or explanation.
        Translate the following text to ${targetLanguage}.`,
        input: text,
      });

      return response.output_text;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(`Translation failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
