import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  BullMqQueueName,
  StorageProviderType,
  StorageStatusType,
} from '@zma-nestjs-monorepo/zma-types';
import {
  StorageServiceCreateFileMetadataInput,
  StorageServiceUpdateFileMetadataInput,
} from '@zma-nestjs-monorepo/zma-types/inputs/storage';
import { FileUtils, IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Queue } from 'bullmq';

import { appConfiguration } from '../../configuration';
import {
  QueueServiceFileProcessingInput,
  UploadServiceCompleteGqlInput,
  UploadServiceRequestGqlInput,
} from '../../core/inputs';
import {
  UploadServiceCompleteGqlOutput,
  UploadServiceRequestGqlOutput,
} from '../../core/outputs/upload.output';
import { FileService } from '../../frameworks/files-services/file-service.service';
import { UploadUtils } from '../../utils/upload.utils';

import { StorageClientGrpcService } from './storage-grpc-client.service';

// Constants
const QUEUE_CONFIG = {
  removeOnComplete: true,
  removeOnFail: true,
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 5000,
  },
} as const;

const MEDIA_TYPE_MAPPINGS = {
  image: 'image/webp',
  video: 'video/webm',
} as const;

interface RequestUploadParams {
  tenantId: string;
  input: UploadServiceRequestGqlInput;
}

interface CompleteUploadParams {
  input: UploadServiceCompleteGqlInput;
  tenantId: string;
}

@Injectable()
export class UploadUseCase {
  private readonly logger = new Logger(UploadUseCase.name);

  constructor(
    private readonly storageService: StorageClientGrpcService,
    @InjectQueue(BullMqQueueName.FileProcessing) private readonly fileQueue: Queue,
    private readonly fileService: FileService,
    @Inject('APP_CONFIG') private readonly appConfig: ReturnType<typeof appConfiguration>,
  ) {}

  /**
   * Adds a file processing job to the queue with retry configuration
   */
  private async addJobToQueue(data: QueueServiceFileProcessingInput): Promise<void> {
    try {
      await this.fileQueue.add(BullMqQueueName.FileProcessing, data, QUEUE_CONFIG);
      this.logger.log(
        `Successfully added file processing job to queue for file ID: ${data.fileId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to add job to queue for file ID: ${data.fileId}`, error);
      throw new Error(`Failed to queue file processing job: ${error.message}`);
    }
  }

  /**
   * Validates the MIME type and returns the corresponding file extension
   */
  private validateMimeTypeAndGetExtension(mimeType: string): string {
    const extension = FileUtils.mimeTypeToExtension(mimeType);
    if (!extension) {
      this.logger.warn(`Unsupported MIME type provided: ${mimeType}`);
      throw new BadRequestException(`Unsupported MIME type: ${mimeType}`);
    }
    return extension;
  }

  /**
   * Generates bucket configuration for staging
   */
  private getStagingBucketConfig() {
    const { staging } = this.appConfig.buckets;
    return {
      name: staging.name,
      provider: staging.provider as StorageProviderType,
    };
  }

  /**
   * Determines the output MIME type based on media type processing rules
   */
  private getProcessedMimeType(originalMimeType: string): string {
    if (originalMimeType.startsWith('image/')) {
      return MEDIA_TYPE_MAPPINGS.image;
    }
    if (originalMimeType.startsWith('video/')) {
      return MEDIA_TYPE_MAPPINGS.video;
    }
    return originalMimeType;
  }

  /**
   * Generates the final file URL for the processed file
   */
  private generateFileUrl(fileId: string, mimeType: string): string {
    const extension = FileUtils.mimeTypeToExtension(mimeType);
    const bucketKey = UploadUtils.generateBucketKey({ fileId, extension });
    return `${this.appConfig.cdn.host}/${bucketKey}`;
  }

  /**
   * Requests an upload by generating a presigned URL and creating file metadata
   */
  async requestUpload({
    tenantId,
    input,
  }: RequestUploadParams): Promise<UploadServiceRequestGqlOutput> {
    const { fileName, mimeType, ownerService, ownerEntityId } = input;

    this.logger.debug(`Processing upload request for file: ${fileName}, tenant: ${tenantId}`);

    // Validate MIME type and get extension
    const extension = this.validateMimeTypeAndGetExtension(mimeType);

    // Generate unique file ID
    const fileId = IdUtils.uuidv7();

    // Get staging bucket configuration
    const { name: bucketName, provider } = this.getStagingBucketConfig();

    // Generate bucket key for staging
    const bucketKey = UploadUtils.generateBucketKey({ fileId, extension });

    try {
      // Generate presigned URL for upload
      const presignedUrl = await this.fileService.putObjectPresignedUrl({
        bucket: bucketName,
        key: bucketKey,
        mimeType,
        providerType: provider,
      });

      // Create file metadata
      const createInput: StorageServiceCreateFileMetadataInput = {
        id: fileId,
        tenantId,
        originalFilename: fileName,
        mimeType,
        bucketKey,
        bucketName,
        provider,
        status: StorageStatusType.Pending,
        ownerService,
        ownerEntityId,
      };

      const fileMetadata = await this.storageService.createFileMetadata(createInput);

      this.logger.log(`Upload request processed successfully for file ID: ${fileId}`);

      return {
        fileId: fileMetadata.id,
        uploadUrl: presignedUrl,
      };
    } catch (error) {
      this.logger.error(`Failed to process upload request for file: ${fileName}`, error);
      throw new Error(`Failed to generate upload URL: ${error.message}`);
    }
  }

  /**
   * Completes the upload process by verifying the file and starting processing
   */
  async completeUpload({
    input,
    tenantId,
  }: CompleteUploadParams): Promise<UploadServiceCompleteGqlOutput> {
    const { fileId } = input;

    this.logger.debug(`Processing upload completion for file ID: ${fileId}, tenant: ${tenantId}`);

    try {
      // Retrieve existing file metadata
      const existingFileMetadata = await this.storageService.getFileMetadataById({
        id: fileId,
        tenantId,
      });

      if (!existingFileMetadata) {
        this.logger.warn(`File metadata not found for ID: ${fileId}, tenant: ${tenantId}`);
        throw new NotFoundException(`File metadata not found for ID: ${fileId}`);
      }

      // Verify file exists in staging bucket
      const stagingBucket = this.getStagingBucketConfig();
      const fileExists = await this.fileService.checkFileExists({
        bucket: stagingBucket.name,
        key: existingFileMetadata.bucketKey,
        providerType: existingFileMetadata.provider,
      });

      if (!fileExists) {
        this.logger.warn(`File does not exist in storage for ID: ${fileId}`);
        throw new NotFoundException(`File does not exist in storage: ${fileId}`);
      }

      // Update file status to processing
      const updateInput: StorageServiceUpdateFileMetadataInput = {
        id: fileId,
        tenantId,
        status: StorageStatusType.Processing,
      };

      const updatedFileMetadata = await this.storageService.updateFileMetadata(updateInput);

      // Add file processing job to queue
      const queueInput: QueueServiceFileProcessingInput = {
        fileId: updatedFileMetadata.id,
        tenantId,
      };

      await this.addJobToQueue(queueInput);

      // Generate final file URL with processed MIME type
      const processedMimeType = this.getProcessedMimeType(existingFileMetadata.mimeType);
      const fileUrl = this.generateFileUrl(existingFileMetadata.id, processedMimeType);

      this.logger.log(`Upload completion processed successfully for file ID: ${fileId}`);

      return {
        fileUrl,
        status: updatedFileMetadata.status,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Failed to complete upload for file ID: ${fileId}`, error);
      throw new Error(`Failed to complete upload: ${error.message}`);
    }
  }
}
