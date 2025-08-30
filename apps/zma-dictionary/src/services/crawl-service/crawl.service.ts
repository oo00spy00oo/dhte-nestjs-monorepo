import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as mime from 'mime-types';
import * as HTMLParser from 'node-html-parser';
import sharp from 'sharp';

import { appConfiguration } from '../../configuration';
import { R2FileService } from '../../frameworks/files-services/r2/r2.file-service.service';

const WEBP_EXTENSION = 'webp';

@Injectable()
export class CrawlService {
  private readonly logger = new Logger(CrawlService.name);
  private readonly appConfig: ReturnType<typeof appConfiguration>;
  constructor(
    private configService: ConfigService,
    private r2FileService: R2FileService,
  ) {
    this.appConfig = appConfiguration(this.configService);
  }

  private checkIsImage(fileUrl: string): boolean {
    const extension = new URL(fileUrl).pathname.split('.').pop()?.toLowerCase();
    if (!extension) {
      throw new Error(`Cannot determine file extension from URL: ${fileUrl}`);
    }
    const imageExts = new Set(['jpg', 'jpeg', 'png', 'webp']);
    return extension ? imageExts.has(extension) : false;
  }

  private checkIsAudio(fileUrl: string): boolean {
    const extension = new URL(fileUrl).pathname.split('.').pop()?.toLowerCase();
    if (!extension) {
      throw new Error(`Cannot determine file extension from URL: ${fileUrl}`);
    }
    const audioExts = new Set(['ogg', 'mp3', 'wav', 'oga']);
    return extension ? audioExts.has(extension) : false;
  }

  private getBucketTypeFromUrl(fileUrl: string): string {
    const { r2 } = this.appConfig;

    if (this.checkIsImage(fileUrl)) return r2.dictionaryImagesBucket;
    if (this.checkIsAudio(fileUrl)) return r2.dictionaryAudiosBucket;

    throw new Error(`Cannot determine bucket type from URL: ${fileUrl}`);
  }

  private generateS3KeyFromUrl({
    fileUrl,
    bucket,
    word,
    partOfSpeech,
    dialect,
    audioKey,
  }: {
    fileUrl: string;
    bucket: string;
    word: string;
    partOfSpeech?: string;
    dialect?: string;
    audioKey?: string;
  }): { key: string; mimeType: string } {
    const { r2 } = this.appConfig;
    const url = new URL(fileUrl);

    const originalFilename = url.pathname.split('/').pop();
    if (!originalFilename) {
      throw new Error(`Cannot extract filename from URL: ${fileUrl}`);
    }

    let key: string;
    switch (bucket) {
      case r2.dictionaryImagesBucket:
        // Example: YellowLabradorLooking.jpg → noun/cow.webp
        key = `${partOfSpeech.toLowerCase()}/${word}.${WEBP_EXTENSION}`;
        break;
      case r2.dictionaryAudiosBucket: {
        // Example: uk/en-uk-apple.ogg or us/en-us-dog.ogg
        key = `${dialect.toLowerCase()}/${audioKey}`;
        break;
      }
      default:
        throw new Error(`Unknown bucket type: ${bucket}`);
    }

    const mimeType = mime.lookup(key) || 'application/octet-stream';

    return {
      key,
      mimeType,
    };
  }

  private async downloadFile(fileUrl: string): Promise<Buffer> {
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const fileBuffer = Buffer.from(response.data);
    if (this.checkIsImage(fileUrl)) {
      const compressedBuffer = await sharp(fileBuffer)
        .webp({ quality: 80, lossless: false })
        .toBuffer();
      return compressedBuffer;
    }

    return fileBuffer;
  }

  private async uploadFileToR2({
    fileUrl,
    word,
    partOfSpeech,
    dialect,
    audioKey,
  }: {
    fileUrl: string;
    word: string;
    partOfSpeech?: string;
    dialect?: string;
    audioKey?: string;
  }): Promise<string> {
    const bucket = this.getBucketTypeFromUrl(fileUrl);
    const { key, mimeType } = this.generateS3KeyFromUrl({
      fileUrl,
      bucket,
      word,
      partOfSpeech,
      dialect,
      audioKey,
    });

    const fileExists = await this.r2FileService.fileExistsInS3({ bucket, key });
    if (fileExists) {
      this.logger.log(`File already exists in R2: ${key}`);
      const existingUrl = `/${bucket}/${key}`;
      return existingUrl;
    }

    const fileBuffer = await this.downloadFile(fileUrl);
    await this.r2FileService.uploadFile({
      bucket,
      key,
      file: fileBuffer,
      mimeType: mimeType,
    });

    this.logger.log(`File uploaded to R2: ${key}`);
    return `/${bucket}/${key}`;
  }

  private async fetchDirectAudioUrl(audioKey: string): Promise<string | null> {
    const fullUrl = `https://en.wiktionary.org/wiki/File:${encodeURIComponent(audioKey)}`;
    this.logger.log(`Fetching: ${fullUrl}`);

    const response = await axios.get(fullUrl);
    const root = HTMLParser.parse(response.data);

    // Match the exact title attribute with the audioKey
    const anchor = root.querySelectorAll('a').find((a) => {
      const href = a.getAttribute('href') || '';
      const title = a.getAttribute('title') || '';
      return (
        href.includes('upload.wikimedia.org') &&
        title.trim().toLowerCase() === audioKey.trim().toLowerCase()
      );
    });

    if (!anchor) return null;

    const href = anchor.getAttribute('href');
    return href?.startsWith('http') ? href : `https:${href}`;
  }

  async fetchDictionaryPage({
    word,
    audioKeys,
    partOfSpeech,
  }: {
    word: string;
    audioKeys?: { dialect: string; audioKey: string }[];
    partOfSpeech?: string;
  }): Promise<{
    word: string;
    imageUrl: string | null;
    audioUrls: { dialect: string; url: string }[];
    error?: string;
  }> {
    try {
      const url = `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`;
      const requestOptions = {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      };

      const response = await axios.get(url, requestOptions);
      const root = HTMLParser.parse(response.data);

      const imageUrl =
        root
          .querySelectorAll('meta[property="og:image"]')
          .map((meta) => meta.getAttribute('content'))
          .find((url) => url && url.includes('upload.wikimedia.org')) || null;

      this.logger.log(`Found image for "${word}": ${imageUrl || 'none'}`);

      const audioUrlPromises = audioKeys.map(async ({ dialect, audioKey }) => {
        const directAudioUrl = await this.fetchDirectAudioUrl(audioKey);
        if (directAudioUrl) {
          this.logger.log(`Found ${dialect} audio for "${word}": ${directAudioUrl}`);
          return { dialect, url: directAudioUrl, audioKey };
        } else {
          this.logger.warn(`No ${dialect} audio found for "${word}"`);
          return null;
        }
      });

      const audioUrls = (await Promise.all(audioUrlPromises)).filter(Boolean);

      const imageUploadUrlPromise = imageUrl
        ? this.uploadFileToR2({ fileUrl: imageUrl, word, partOfSpeech })
        : Promise.resolve(null);

      const audioUploadPromises = audioUrls.map(async ({ dialect, url, audioKey }) => {
        const uploadedUrl = await this.uploadFileToR2({
          fileUrl: url,
          word,
          partOfSpeech,
          dialect,
          audioKey,
        });
        return { dialect, url: uploadedUrl };
      });

      const [imageUploadUrl, uploadedAudioUrls] = await Promise.all([
        imageUploadUrlPromise,
        Promise.all(audioUploadPromises),
      ]);

      return {
        word,
        imageUrl: imageUploadUrl,
        audioUrls: uploadedAudioUrls.filter(({ url }) => !!url),
      };
    } catch (error) {
      this.logger.error(`Error fetching Wiktionary data for "${word}":`, error.message);
      return {
        word,
        imageUrl: null,
        audioUrls: [],
        error: error.message,
      };
    }
  }
}
