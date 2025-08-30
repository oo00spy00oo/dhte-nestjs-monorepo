import {
  BadRequestException,
  Injectable,
  Logger,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileUtils } from '@zma-nestjs-monorepo/zma-utils';
import dayjs from 'dayjs';
import * as mime from 'mime-types';

import { appConfiguration } from '../../configuration';
import { UploadOutput } from '../../core/outputs';
import { R2FileService } from '../../frameworks/files-services/r2/r2.file-service.service';

const COURSE_ASSET_PREFIX = 'course/';
const MAX_AUDIO_SIZE_IN_BYTES = 5 * 1024 * 1024; // 5MB
@Injectable()
export class UploadUseCase {
  private readonly logger = new Logger(UploadUseCase.name);
  private readonly appConfig: ReturnType<typeof appConfiguration>;

  constructor(
    private readonly r2FileService: R2FileService,
    private readonly configService: ConfigService,
  ) {
    this.appConfig = appConfiguration(this.configService);
  }

  private generateR2Key({
    userId,
    extension,
    isCommonAsset = false,
  }: {
    userId: string;
    extension: string;
    isCommonAsset?: boolean;
  }): string {
    return `${isCommonAsset ? COURSE_ASSET_PREFIX : ''}${userId}/${dayjs().valueOf()}.${extension}`;
  }

  private async uploadToR2(params: {
    buffer: Buffer;
    key: string;
    bucket: string;
    baseUrl: string;
  }): Promise<UploadOutput> {
    const { buffer, key, bucket, baseUrl } = params;
    const mimeType = mime.lookup(key) || 'application/octet-stream';

    await this.r2FileService.uploadFile({
      bucket,
      key,
      file: buffer,
      mimeType,
    });

    return {
      key,
      url: `${baseUrl}/${key}`,
    };
  }

  private validateAudioFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const mimeType = file.mimetype;

    if (!mimeType.startsWith('audio/') || !FileUtils.mimeTypeToExtension(mimeType)) {
      throw new UnsupportedMediaTypeException(`Invalid audio format: ${file.originalname}`);
    }

    const maxSizeMb = MAX_AUDIO_SIZE_IN_BYTES / 1024 / 1024;
    if (file.size > MAX_AUDIO_SIZE_IN_BYTES) {
      throw new PayloadTooLargeException(
        `Audio file ${file.originalname} exceeds maximum size of ${maxSizeMb}MB`,
      );
    }
  }

  async uploadAudio({
    file,
    userId,
  }: {
    file: Express.Multer.File;
    userId: string;
  }): Promise<UploadOutput> {
    this.validateAudioFile(file);
    const extension = FileUtils.mimeTypeToExtension(file.mimetype);
    const r2Key = this.generateR2Key({ userId, extension });

    const result = await this.uploadToR2({
      buffer: file.buffer,
      key: r2Key,
      bucket: this.appConfig.r2.userAudiosBucket,
      baseUrl: this.appConfig.r2.userAudiosBaseUrl,
    });

    this.logger.log(`Audio uploaded successfully: ${r2Key}`);
    return result;
  }
}
