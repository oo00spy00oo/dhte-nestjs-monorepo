import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaToken, KafkaTopic } from '@zma-nestjs-monorepo/zma-types';
import { FileUtils } from '@zma-nestjs-monorepo/zma-utils';
import axios from 'axios';

import { appConfiguration } from '../../configuration';
import {
  LarvaCourseServiceCrawlSentenceKafkaInput,
  LarvaCourseServiceUpdateSentenceGqlInput,
} from '../../core/inputs';
import { AnalyzeAiService } from '../../frameworks/ai-services/analyze/analyze.ai-service.service';
import {
  SentenceEntity,
  WordOfSentenceEntity,
} from '../../frameworks/data-services/mongo/entities';
import { R2FileService } from '../../frameworks/files-services/r2/r2.file-service.service';

interface CrawlContext {
  sentence: SentenceEntity;
  updateData: LarvaCourseServiceUpdateSentenceGqlInput;
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
interface S3KeyParams {
  sentenceId: string;
  mimeType: string;
  word?: string;
}

@Injectable()
export class CrawlSentenceService {
  private readonly logger = new Logger(CrawlSentenceService.name);
  private readonly appConfig = appConfiguration(this.configService);
  private readonly AUDIO_CACHE_TTL = 3600; // 1 hour
  private readonly AUDIO_CACHE_PREFIX = 'audio:tts:';
  private readonly DEFAULT_RETRIES = 1;

  constructor(
    private readonly aiService: AnalyzeAiService,
    private readonly r2FileService: R2FileService,
    private readonly configService: ConfigService,
    @Inject(KafkaToken.LarvaCourseService) private kafkaClient: ClientKafka,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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

  private async runWithConcurrencyLimit<T>({
    items,
    limit,
    handler,
  }: {
    items: T[];
    limit: number;
    handler: (item: T) => Promise<void>;
  }) {
    for (let i = 0; i < items.length; i += limit) {
      await Promise.all(items.slice(i, i + limit).map(handler));
    }
  }
  private sanitizeFileName(name: string): string {
    return name
      .normalize('NFKD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritic marks
      .toLowerCase() // Convert to lowercase
      .replace(/'/g, '') // Remove apostrophes
      .replace(/[^a-z0-9_-]/g, '_') // Replace anything else with underscore
      .replace(/_+/g, '_') // Collapse multiple underscores
      .replace(/^-+|-+$/g, '') // Trim leading/trailing hyphens
      .replace(/^_+|_+$/g, ''); // Trim leading/trailing underscores
  }

  private generateS3Key({ sentenceId, mimeType, word }: S3KeyParams): string {
    const ext = FileUtils.mimeTypeToExtension(mimeType);
    if (!ext) throw new Error(`Unsupported file type: ${mimeType}`);
    if (mimeType.startsWith('video/')) return `videos/sentences/${sentenceId}.${ext}`;
    if (mimeType.startsWith('audio/')) {
      if (!word) throw new Error('"word" is required for audio files');
      const safeWord = this.sanitizeFileName(word);
      return `audios/sentences/${sentenceId}/${safeWord}.${ext}`;
    }
    throw new Error(`Unsupported MIME type: ${mimeType}`);
  }

  private async uploadToR2({
    buffer,
    key,
    mimeType,
    bucket = this.appConfig.r2.commonAssetsBucket,
  }: {
    buffer: Buffer;
    key: string;
    mimeType: string;
    bucket?: string;
  }) {
    await this.r2FileService.uploadFile({ bucket, key, file: buffer, mimeType });
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
    const cached = await this.cacheManager.get<CachedAudioResult>(cacheKey);

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

    await this.cacheManager.set(cacheKey, { url, mimeType }, this.AUDIO_CACHE_TTL);
    return { url, buffer, mimeType };
  }

  /** ------- Kafka ------- **/
  emitKafkaCrawlEvent(data: LarvaCourseServiceCrawlSentenceKafkaInput): void {
    const topic = KafkaTopic.LarvaCourseCrawlSentenceTopic;
    this.kafkaClient.emit(topic, data);
  }

  /** ------- Processing helpers ------- **/
  private async processWordAudio({
    word,
    sentence,
    updateData,
  }: {
    word: WordOfSentenceEntity;
    sentence: SentenceEntity;
    updateData: LarvaCourseServiceUpdateSentenceGqlInput;
  }): Promise<void> {
    const audio = await this.getOrGenerateAudio(word.word);
    const key = this.generateS3Key({
      sentenceId: sentence._id,
      mimeType: audio.mimeType,
      word: word.word,
    });
    await this.uploadToR2({
      buffer: audio.buffer,
      key,
      mimeType: audio.mimeType,
    });

    if (!updateData.words) updateData.words = [...(sentence.words || [])];
    const idx = sentence.words.findIndex(
      (w) => w.word === word.word && w.position === word.position,
    );
    if (idx !== -1) updateData.words[idx] = { ...updateData.words[idx], audioUrl: key };
  }

  private async crawlWordAudios(ctx: CrawlContext): Promise<void> {
    const missing = (ctx.sentence.words || []).filter((w) => !w.audioUrl);
    if (!missing.length) {
      this.logger.debug(`No missing word audios for sentence ${ctx.sentence._id}`);
      return;
    }
    try {
      await this.runWithConcurrencyLimit({
        items: missing,
        limit: 3,
        handler: (w) =>
          this.processWordAudio({
            word: w,
            sentence: ctx.sentence,
            updateData: ctx.updateData,
          }),
      });

      this.logger.log(`Processed ${missing.length} word audios for sentence ${ctx.sentence._id}`);
    } catch (err) {
      this.logger.error(`Failed to process word audios for sentence ${ctx.sentence._id}`, err);
    }
  }

  private async crawlVideo(ctx: CrawlContext, retries = this.DEFAULT_RETRIES): Promise<void> {
    if (ctx.sentence.videos?.length) {
      this.logger.debug(`No video needed for sentence ${ctx.sentence._id}`);
      return;
    }
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const audio = await this.getOrGenerateAudio(ctx.sentence.content);
        const { url: videoUrl } = await this.aiService.generateLipSync({
          audioUrl: audio.url,
          videoUrl: this.appConfig.sampleAiVideoUrl,
        });

        const buffer = await this.downloadFile(videoUrl);
        const { type: mimeType } = FileUtils.getMimeTypeFromBuffer(buffer);
        const key = this.generateS3Key({ sentenceId: ctx.sentence._id, mimeType });

        await this.uploadToR2({
          buffer,
          key,
          mimeType,
        });

        ctx.updateData.videos = [
          ...(ctx.sentence.videos || []),
          { url: key, caption: `Video for sentence: ${ctx.sentence._id}` },
        ];
        return;
      } catch (err) {
        const attemptInfo = `Attempt ${attempt} of ${retries}`;
        const errorMsg = err instanceof Error ? err.message : String(err);
        const stackInfo = err instanceof Error && err.stack ? `\nStack: ${err.stack}` : '';

        this.logError(
          `[VideoCrawl] ${attemptInfo} failed for sentence "${ctx.sentence._id}"` +
            `\nReason: ${errorMsg}${stackInfo}`,
          err,
        );

        if (attempt < retries) {
          await this.delay(2 ** attempt * 1000);
        } else {
          this.logger.warn(
            `[VideoCrawl] All ${retries} attempts failed for sentence "${ctx.sentence._id}". Continuing without video.`,
          );
        }
      }
    }
  }

  /** ------- Main ------- **/
  async crawlSentence(sentence: SentenceEntity): Promise<LarvaCourseServiceUpdateSentenceGqlInput> {
    if (!sentence?._id) throw new Error('Invalid sentence entity: missing _id');

    const updateData: LarvaCourseServiceUpdateSentenceGqlInput = {};
    const ctx: CrawlContext = { sentence, updateData };

    await Promise.allSettled([this.crawlVideo(ctx), this.crawlWordAudios(ctx)]);

    return updateData;
  }

  async cleanSentenceAssets(sentence: SentenceEntity): Promise<void> {
    if (!sentence?._id) {
      throw new Error('Invalid sentence entity: missing _id');
    }

    const bucket = this.appConfig.r2.commonAssetsBucket;

    const urls = [
      ...(sentence.words?.map((w) => w.audioUrl) || []),
      ...(sentence.videos?.map((v) => v.url) || []),
    ].filter(Boolean);

    const results = await Promise.allSettled(
      urls.map((key) => this.r2FileService.deleteFile({ bucket, key })),
    );
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.warn(`Failed to delete asset with key "${urls[index]}": ${result.reason}`);
      }
    });
    this.logger.log(`Cleaned assets for sentence ${sentence._id}`);
  }
}
