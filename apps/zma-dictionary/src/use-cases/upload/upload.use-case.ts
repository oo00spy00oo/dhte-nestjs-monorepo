import {
  BadRequestException,
  Injectable,
  Logger,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DictionaryServiceUpdateDictionaryGqlInput } from '@zma-nestjs-monorepo/zma-types/inputs/dictionary';
import { FileUtils } from '@zma-nestjs-monorepo/zma-utils';
import sharp from 'sharp';

import { appConfiguration } from '../../configuration';
import { IDataServices } from '../../core';
import { DictionaryDialectEnum } from '../../core/types';
import {
  DictionaryEntity,
  DictionaryPronunciationEntity,
} from '../../frameworks/data-services/mongo/entities';
import { R2FileService } from '../../frameworks/files-services/r2/r2.file-service.service';
import { VirusScannerService } from '../../services/virus-scanner/virus-scanner.service';
import { CommonUtils } from '../../utils';

const MAX_IMAGE_SIZE_IN_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_AUDIO_SIZE_IN_BYTES = 5 * 1024 * 1024; // 5MB
const TARGET_IMAGE_MIME_TYPE = 'image/webp';

interface FileValidationConfig {
  maxSize: number;
  fileType: string;
}

@Injectable()
export class UploadUseCase {
  private readonly logger = new Logger(UploadUseCase.name);
  private readonly appConfig: ReturnType<typeof appConfiguration>;

  constructor(
    private readonly r2FileService: R2FileService,
    private readonly configService: ConfigService,
    private readonly dataServices: IDataServices,
    private readonly virusScannerService: VirusScannerService,
  ) {
    this.appConfig = appConfiguration(this.configService);
  }

  private getFileValidationConfig(mimeType: string): FileValidationConfig {
    if (mimeType.startsWith('image/')) {
      return { maxSize: MAX_IMAGE_SIZE_IN_BYTES, fileType: 'image' };
    }
    return { maxSize: MAX_AUDIO_SIZE_IN_BYTES, fileType: 'audio' };
  }

  private validateFiles({
    image,
    audios,
  }: {
    image?: Express.Multer.File;
    audios?: Express.Multer.File[];
  }): void {
    if (!image && !audios?.length) {
      throw new BadRequestException('At least one of image or audio file must be provided');
    }

    const allFiles = [...(image ? [image] : []), ...(audios || [])];

    for (const file of allFiles) {
      if (!FileUtils.mimeTypeToExtension(file.mimetype)) {
        const { fileType } = this.getFileValidationConfig(file.mimetype);
        throw new UnsupportedMediaTypeException(`Invalid ${fileType} format: ${file.originalname}`);
      }

      const { maxSize, fileType } = this.getFileValidationConfig(file.mimetype);
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / 1024 / 1024;
        throw new PayloadTooLargeException(
          `${fileType} file ${file.originalname} exceeds maximum size of ${maxSizeMB}MB`,
        );
      }
    }
  }

  private async scanVirus(files: Express.Multer.File[]): Promise<void> {
    await Promise.all(
      files.map(async (file) => {
        const scanResult = await this.virusScannerService.scanBuffer(file.buffer);
        if (!scanResult.isClean) {
          const reason = scanResult.isInfected
            ? `is infected with ${scanResult.viruses.join(', ')}`
            : `could not be scanned (reason: ${scanResult.error})`;
          throw new BadRequestException(
            `File ${file.originalname} was rejected because it ${reason}.`,
          );
        }
      }),
    );
  }

  private async processFileBeforeUpload({
    fileBuffer,
    mimeType,
  }: {
    fileBuffer: Buffer;
    mimeType: string;
  }): Promise<Buffer> {
    if (!mimeType.startsWith('image/') || mimeType === 'image/webp') {
      return fileBuffer;
    }

    try {
      return await sharp(fileBuffer).webp({ quality: 80 }).toBuffer();
    } catch (error) {
      this.logger.warn(`Failed to convert image to WebP: ${error.message}`);
      return fileBuffer;
    }
  }

  private async uploadImage({
    image,
    dictionaryEntity,
  }: {
    image: Express.Multer.File;
    dictionaryEntity: DictionaryEntity;
  }): Promise<void> {
    const mimeType = TARGET_IMAGE_MIME_TYPE;
    const key = CommonUtils.generateS3Key({
      mimeType,
      word: dictionaryEntity.word,
      partOfSpeech: dictionaryEntity.partOfSpeech,
    });

    const processedBuffer = await this.processFileBeforeUpload({
      fileBuffer: image.buffer,
      mimeType: image.mimetype,
    });

    // Delete existing image if present
    if (dictionaryEntity.hasImage) {
      await this.r2FileService.deleteFile({
        bucket: this.appConfig.r2.dictionaryImagesBucket,
        key,
      });
      this.logger.log(`Deleted existing image for word: ${dictionaryEntity.word}`);
    }

    await this.r2FileService.uploadFile({
      bucket: this.appConfig.r2.dictionaryImagesBucket,
      key,
      file: processedBuffer,
      mimeType,
    });
    this.logger.log(`Uploaded new image for word ${dictionaryEntity.word} with key: ${key}`);
  }

  private async uploadAudio({
    file,
    dialect,
    dictionaryEntity,
    existingDialects,
    updatedPronunciations,
  }: {
    file: Express.Multer.File;
    dialect: string;
    dictionaryEntity: DictionaryEntity;
    existingDialects: Set<string>;
    updatedPronunciations: DictionaryPronunciationEntity[];
  }): Promise<void> {
    if (!existingDialects.has(dialect)) {
      this.logger.debug(`Skipping dialect ${dialect} — not in dictionaryEntity`);
      return;
    }

    const mimeType = file.mimetype;

    const key = CommonUtils.generateS3Key({
      mimeType,
      word: dictionaryEntity.word,
      partOfSpeech: dictionaryEntity.partOfSpeech,
      dialect,
    });

    const newAudioKey = key.split('/').pop();
    if (!newAudioKey) {
      throw new Error('Failed to generate audio key');
    }

    // Delete old audio if exists
    if (dictionaryEntity.hasAudio) {
      const existingPronunciation = dictionaryEntity.pronunciations.find(
        (p) => p.dialect === dialect,
      );

      if (existingPronunciation?.audioKey) {
        await this.r2FileService.deleteFile({
          bucket: this.appConfig.r2.dictionaryAudiosBucket,
          key: `${dialect.toLowerCase()}/${existingPronunciation.audioKey}`,
        });
        this.logger.log(`Deleted existing audio for dialect ${dialect}`);
      }
    }

    await this.r2FileService.uploadFile({
      bucket: this.appConfig.r2.dictionaryAudiosBucket,
      key,
      file: file.buffer,
      mimeType,
    });

    this.logger.log(`Uploaded new audio for dialect ${dialect} with key: ${key}`);

    const index = updatedPronunciations.findIndex((p) => p.dialect === dialect);

    if (index !== -1) {
      updatedPronunciations[index] = {
        ...updatedPronunciations[index],
        audioKey: newAudioKey,
      };
    }
  }

  async uploadDictionaryAssets({
    image,
    audios = [],
    id,
  }: {
    image?: Express.Multer.File;
    audios?: { region: DictionaryDialectEnum; file: Express.Multer.File }[];
    id: string;
  }): Promise<boolean> {
    const filteredAudios = audios.reduce<Express.Multer.File[]>((acc, audio) => {
      if (audio.file) acc.push(audio.file);
      return acc;
    }, []);
    this.validateFiles({ image, audios: filteredAudios });
    await this.scanVirus([...(image ? [image] : []), ...filteredAudios]);

    const dictionaryEntity = await this.dataServices.dictionaryService.findById({ id });
    const existingDialects = new Set(dictionaryEntity.pronunciations?.map((p) => p.dialect) ?? []);

    const updateData: DictionaryServiceUpdateDictionaryGqlInput = {};
    const updatedPronunciations = [...(dictionaryEntity.pronunciations || [])];

    const tasks: Promise<void>[] = [];

    if (image) {
      tasks.push(this.uploadImage({ image, dictionaryEntity }));
      if (!dictionaryEntity.hasImage) {
        updateData.hasImage = true;
      }
    }

    for (const { region, file } of audios) {
      tasks.push(
        this.uploadAudio({
          file,
          dialect: region,
          dictionaryEntity,
          existingDialects,
          updatedPronunciations,
        }),
      );
    }

    await Promise.all(tasks);

    if (audios.length > 0) {
      updateData.pronunciations = updatedPronunciations;
      updateData.hasAudio = true;
    }

    if (Object.keys(updateData).length > 0) {
      await this.dataServices.dictionaryService.updateOne({
        id: dictionaryEntity._id,
        update: {
          item: updateData,
        },
      });
    }

    return true;
  }
}
