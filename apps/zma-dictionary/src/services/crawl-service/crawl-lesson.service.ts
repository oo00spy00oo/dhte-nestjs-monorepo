import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LanguageEnum } from '@zma-nestjs-monorepo/zma-types';
import { DictionaryServiceUpdateDictionaryGqlInput } from '@zma-nestjs-monorepo/zma-types/inputs/dictionary';
import { FileUtils } from '@zma-nestjs-monorepo/zma-utils';
import axios from 'axios';

import { appConfiguration } from '../../configuration';
import { AiServiceTranslateLanguageEnum } from '../../core/types';
import { AnalyzeAiService } from '../../frameworks/ai-services/analyze/analyze.ai-service.service';
import { DictionaryEntity } from '../../frameworks/data-services/mongo/entities';
import { R2FileService } from '../../frameworks/files-services/r2/r2.file-service.service';
import { CommonUtils } from '../../utils';

interface CrawlContext {
  word: DictionaryEntity;
  updateData: DictionaryServiceUpdateDictionaryGqlInput;
}
interface AudioGenerationResult {
  url: string;
  buffer: Buffer;
  mimeType: string;
}
interface CachedAudioResult {
  url: string;
  mimeType: string;
}

@Injectable()
export class CrawlLessonService {
  private readonly logger = new Logger(CrawlLessonService.name);
  private readonly appConfig = appConfiguration(this.configService);
  private readonly AUDIO_CACHE_TTL = 3600; // 1 hour
  private readonly AUDIO_CACHE_PREFIX = 'audio:lesson:';
  private readonly DEFAULT_RETRIES = 1;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly aiService: AnalyzeAiService,
    private readonly configService: ConfigService,
    private readonly r2FileService: R2FileService,
  ) {}

  /** ------- Logging helpers ------- **/
  private logError(msg: string, error: Error) {
    this.logger.error(`${msg}: ${error.message}`, error.stack);
  }
  private logWarn(msg: string, error?: Error) {
    this.logger.warn(`${msg}${error ? `: ${error.message}` : ''}`);
  }

  /** ------- Common utils ------- **/
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateAudioCacheKey(text: string): string {
    const normalized = text.toLowerCase().trim().replace(/\s+/g, ' ');
    const hash = Buffer.from(normalized)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 32);
    return `${this.AUDIO_CACHE_PREFIX}${hash}`;
  }

  private async uploadToR2({
    buffer,
    key,
    mimeType,
    bucket,
    isDictionary = true,
  }: {
    buffer: Buffer;
    key: string;
    mimeType: string;
    bucket: string;
    isDictionary?: boolean;
  }) {
    await this.r2FileService.uploadFile({ bucket, key, file: buffer, mimeType, isDictionary });
    this.logger.debug(`Uploaded file: ${key}`);
  }

  /** ------- Network helpers ------- **/
  private async downloadFile(url: string, retries = this.DEFAULT_RETRIES): Promise<Buffer> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await axios.get<ArrayBuffer>(url, {
          responseType: 'arraybuffer',
          timeout: 60000,
        });
        return Buffer.from(res.data);
      } catch (e) {
        this.logWarn(`Download attempt ${attempt} failed for ${url}`, e);
        if (attempt === retries) throw e;
        await this.delay(2 ** attempt * 1000);
      }
    }
  }

  /** ------- Audio caching & generation ------- **/
  private async getOrGenerateAudio(text: string): Promise<AudioGenerationResult> {
    const cacheKey = this.generateAudioCacheKey(text);
    const cached = await this.cache.get<CachedAudioResult>(cacheKey);

    if (cached) {
      try {
        const buffer = await this.downloadFile(cached.url);
        return { url: cached.url, buffer, mimeType: cached.mimeType };
      } catch {
        this.logWarn(`Cached audio download failed, regenerating: ${text}`);
      }
    }

    const { url } = await this.aiService.generateTextToSpeech({ message: text });
    const buffer = await this.downloadFile(url);
    const { type: mimeType } = FileUtils.getMimeTypeFromBuffer(buffer);

    await this.cache.set(cacheKey, { url, mimeType }, this.AUDIO_CACHE_TTL);
    return { url, buffer, mimeType };
  }

  /** ------- Crawl steps ------- **/
  private needsAudioUpdate(word: DictionaryEntity): boolean {
    const audioKey = word.pronunciations?.find((p) => p.dialect === 'UK')?.audioKey?.toLowerCase();
    return !audioKey || audioKey.endsWith('.ogg');
  }

  private async crawlAudio(ctx: CrawlContext): Promise<void> {
    if (!this.needsAudioUpdate(ctx.word)) {
      this.logger.debug(`No audio update needed for ${ctx.word.word}`);
      return;
    }

    try {
      const audio = await this.getOrGenerateAudio(ctx.word.word);
      const newKey = CommonUtils.generateS3Key({
        mimeType: audio.mimeType,
        word: ctx.word.word,
        partOfSpeech: ctx.word.partOfSpeech,
        dialect: 'UK',
      });

      await this.uploadToR2({
        buffer: audio.buffer,
        key: newKey,
        mimeType: audio.mimeType,
        bucket: this.appConfig.r2.dictionaryAudiosBucket,
      });

      const oldKey = ctx.word.pronunciations?.find((p) => p.dialect === 'UK')?.audioKey;
      if (oldKey) {
        await this.r2FileService
          .deleteFile({
            bucket: this.appConfig.r2.dictionaryAudiosBucket,
            key: `uk/${oldKey}`,
          })
          .catch((err) => this.logWarn(`Failed to delete old audio for ${ctx.word.word}`, err));
      }

      const lastPart = newKey.split('/').pop();
      if (!lastPart) throw new Error('Invalid key: ' + newKey);
      const audioKey = lastPart;

      ctx.updateData.pronunciations = [...(ctx.word.pronunciations || [])];
      const idx = ctx.updateData.pronunciations.findIndex((p) => p.dialect === 'UK');
      if (idx !== -1) ctx.updateData.pronunciations[idx].audioKey = audioKey;
      else ctx.updateData.pronunciations.push({ dialect: 'UK', audioKey, phoneticSpelling: '' });
    } catch (err) {
      this.logError(`Failed to crawl audio for ${ctx.word.word}`, err);
    }
  }

  private needsTranslationUpdate(word: DictionaryEntity): boolean {
    return !word.wordTranslations?.some((t) => t.lang === LanguageEnum.VI);
  }

  private async crawlTranslation(ctx: CrawlContext): Promise<void> {
    if (!this.needsTranslationUpdate(ctx.word)) {
      this.logger.debug(`No translation needed for ${ctx.word.word}`);
      return;
    }

    try {
      const { message } = await this.aiService.translateText({
        message: ctx.word.word,
        language: AiServiceTranslateLanguageEnum.VI,
      });
      ctx.updateData.wordTranslations = [
        ...(ctx.word.wordTranslations || []),
        { lang: LanguageEnum.VI, translation: message },
      ];
    } catch (err) {
      this.logError(`Failed to crawl translation for ${ctx.word.word}`, err);
    }
  }

  private async crawlVideo(ctx: CrawlContext, retries = this.DEFAULT_RETRIES): Promise<void> {
    if (ctx.word.videos?.length) {
      this.logger.debug(`No video needed for ${ctx.word.word}`);
      return;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const audio = await this.getOrGenerateAudio(ctx.word.word);
        const { url: videoUrl } = await this.aiService.generateLipSync({
          audioUrl: audio.url,
          videoUrl: this.appConfig.sampleAiVideoUrl,
        });

        const buffer = await this.downloadFile(videoUrl);
        const { type: mimeType } = FileUtils.getMimeTypeFromBuffer(buffer);
        const newKey = CommonUtils.generateS3Key({
          mimeType,
          word: ctx.word.word,
          partOfSpeech: ctx.word.partOfSpeech,
          dialect: 'UK',
          isCommonAsset: true,
        });

        await this.uploadToR2({
          buffer,
          key: newKey,
          mimeType,
          bucket: this.appConfig.r2.commonAssetsBucket,
          isDictionary: false,
        });

        ctx.updateData.videos = [
          ...(ctx.word.videos || []),
          { url: newKey, caption: `Video for ${ctx.word.word}` },
        ];
        return;
      } catch (err) {
        const attemptInfo = `Attempt ${attempt} of ${retries}`;
        const errorMsg = err instanceof Error ? err.message : String(err);
        const stackInfo = err instanceof Error && err.stack ? `\nStack: ${err.stack}` : '';

        this.logError(
          `[VideoCrawl] ${attemptInfo} failed for word "${ctx.word.word}"` +
            `\nPart of Speech: ${ctx.word.partOfSpeech || 'N/A'}` +
            `\nReason: ${errorMsg}${stackInfo}`,
          err,
        );

        if (attempt < retries) {
          await this.delay(2 ** attempt * 1000);
        } else {
          this.logger.warn(
            `[VideoCrawl] All ${retries} attempts failed for word "${ctx.word.word}". Continuing without video.`,
          );
        }
      }
    }
  }

  /** ------- Main ------- **/
  async crawlWordForLesson(
    word: DictionaryEntity,
  ): Promise<DictionaryServiceUpdateDictionaryGqlInput> {
    if (!word?.word) throw new Error('Invalid dictionary entity: missing "word"');

    const updateData: DictionaryServiceUpdateDictionaryGqlInput = {};
    const ctx: CrawlContext = { word, updateData };

    await Promise.allSettled([this.crawlAudio(ctx), this.crawlTranslation(ctx)]);
    await this.crawlVideo(ctx);

    return updateData;
  }
}
