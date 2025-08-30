import { unlinkSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import {
  BullMqQueueName,
  StorageProviderType,
  StorageStatusType,
} from '@zma-nestjs-monorepo/zma-types';
import { StorageServiceFileMetadataOutput } from '@zma-nestjs-monorepo/zma-types/outputs/storage';
import { FileUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Job } from 'bullmq';
import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';

import { appConfiguration } from '../../configuration';
import { QueueServiceFileProcessingInput } from '../../core/inputs';
import { FileService } from '../../frameworks/files-services/file-service.service';
import { VirusScannerService } from '../../services/virus-scanner/virus-scanner.service';
import { UploadUtils } from '../../utils/upload.utils';

import { StorageClientGrpcService } from './storage-grpc-client.service';

interface ProcessedFileData {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  bucket: string;
  provider: StorageProviderType;
  bucketKey: string;
  variant?: string; // e.g., 'webm', 'mp4', 'webp'
}

@Processor(BullMqQueueName.FileProcessing)
export class UploadWorkerService extends WorkerHost {
  private readonly logger = new Logger(UploadWorkerService.name);

  constructor(
    private readonly storageService: StorageClientGrpcService,
    private readonly virusScannerService: VirusScannerService,
    private readonly fileService: FileService,
    @Inject('APP_CONFIG') private readonly appConfig: ReturnType<typeof appConfiguration>,
  ) {
    super();

    // Set ffmpeg path from configuration
    ffmpeg.setFfmpegPath(this.appConfig.ffmpeg.path);
  }

  private async processFileBuffer({
    fileBuffer,
    mimeType,
  }: {
    fileBuffer: Buffer;
    mimeType: string;
  }): Promise<ProcessedFileData[]> {
    const results: ProcessedFileData[] = [];

    // Handle image conversion to WebP
    if (mimeType.startsWith('image/') && mimeType !== 'image/webp') {
      try {
        const processedBuffer = await sharp(fileBuffer).webp({ quality: 80 }).toBuffer();
        const { bucket, provider } = this.fileService.getPermanentBucketForMimeType('image/webp');

        results.push({
          buffer: processedBuffer,
          mimeType: 'image/webp',
          extension: 'webp',
          bucket,
          provider,
          bucketKey: '', // Will be set later
          variant: 'webp',
        });
      } catch (error) {
        this.logger.warn(`Failed to convert image to WebP: ${(error as Error).message}`);
        // Fall back to original
        const { type: detectedMimeType, extension } = FileUtils.getMimeTypeFromBuffer(fileBuffer);
        const { bucket, provider } =
          this.fileService.getPermanentBucketForMimeType(detectedMimeType);

        results.push({
          buffer: fileBuffer,
          mimeType: detectedMimeType,
          extension,
          bucket,
          provider,
          bucketKey: '', // Will be set later
        });
      }
    }
    // Handle video conversion to WebM
    else if (mimeType.startsWith('video/')) {
      const conversion = {
        format: 'webm',
        codec: 'libvpx-vp9',
        audioCodec: 'libopus',
        mimeType: 'video/webm',
      };

      try {
        const convertedBuffer = await new Promise<Buffer>((resolve, reject) => {
          // Create temporary input file
          const tempInputPath = join(
            tmpdir(),
            `ffmpeg_input_${Date.now()}_${Math.random().toString(36).substring(7)}.tmp`,
          );
          const tempOutputPath = join(
            tmpdir(),
            `ffmpeg_output_${Date.now()}_${Math.random().toString(36).substring(7)}.${conversion.format}`,
          );

          // Write buffer to temporary file
          writeFile(tempInputPath, fileBuffer)
            .then(() => {
              const ffmpegCommand = ffmpeg(tempInputPath)
                .outputFormat(conversion.format)
                .videoCodec(conversion.codec)
                .audioCodec(conversion.audioCodec)
                .output(tempOutputPath);

              // Add format-specific options for WebM
              ffmpegCommand.outputOptions([
                '-crf 30',
                '-b:v 0',
                '-deadline realtime',
                '-cpu-used 8',
              ]);

              ffmpegCommand
                .on('error', (err) => {
                  this.logger.warn(
                    `Failed to convert video to ${conversion.format.toUpperCase()}: ${err.message}`,
                  );
                  // Cleanup temp files
                  try {
                    unlinkSync(tempInputPath);
                    unlinkSync(tempOutputPath);
                  } catch (cleanupError) {
                    this.logger.warn(
                      `Failed to cleanup temp files: ${(cleanupError as Error).message}`,
                    );
                  }
                  reject(err);
                })
                .on('end', async () => {
                  try {
                    // Read the output file
                    const { readFile } = await import('node:fs/promises');
                    const processedBuffer = await readFile(tempOutputPath);

                    // Cleanup temp files
                    try {
                      unlinkSync(tempInputPath);
                      unlinkSync(tempOutputPath);
                    } catch (cleanupError) {
                      this.logger.warn(
                        `Failed to cleanup temp files: ${(cleanupError as Error).message}`,
                      );
                    }

                    resolve(processedBuffer);
                  } catch (readError) {
                    this.logger.warn(`Failed to read output file: ${(readError as Error).message}`);
                    // Cleanup temp files
                    try {
                      unlinkSync(tempInputPath);
                      unlinkSync(tempOutputPath);
                    } catch (cleanupError) {
                      this.logger.warn(
                        `Failed to cleanup temp files: ${(cleanupError as Error).message}`,
                      );
                    }
                    reject(readError);
                  }
                })
                .run();
            })
            .catch((writeError) => {
              this.logger.warn(`Failed to write temp input file: ${(writeError as Error).message}`);
              // Cleanup temp input file if it was created
              try {
                unlinkSync(tempInputPath);
              } catch (cleanupError) {
                this.logger.warn(
                  `Failed to cleanup temp input file: ${(cleanupError as Error).message}`,
                );
              }
              reject(writeError);
            });
        });

        const { bucket, provider } = this.fileService.getPermanentBucketForMimeType(
          conversion.mimeType,
        );
        results.push({
          buffer: convertedBuffer,
          mimeType: conversion.mimeType,
          extension: conversion.format,
          bucket,
          provider,
          bucketKey: '', // Will be set later
          variant: conversion.format,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to convert video to ${conversion.format.toUpperCase()}: ${(error as Error).message}`,
        );
        // Fall back to original on conversion failure
        const { type: detectedMimeType, extension } = FileUtils.getMimeTypeFromBuffer(fileBuffer);
        const { bucket, provider } =
          this.fileService.getPermanentBucketForMimeType(detectedMimeType);

        results.push({
          buffer: fileBuffer,
          mimeType: detectedMimeType,
          extension,
          bucket,
          provider,
          bucketKey: '', // Will be set later
        });
      }
    }
    // Handle other file types (no conversion needed)
    else {
      const { type: detectedMimeType, extension } = FileUtils.getMimeTypeFromBuffer(fileBuffer);
      const { bucket, provider } = this.fileService.getPermanentBucketForMimeType(detectedMimeType);

      results.push({
        buffer: fileBuffer,
        mimeType: detectedMimeType,
        extension,
        bucket,
        provider,
        bucketKey: '', // Will be set later
      });
    }

    return results;
  }

  private async updateFileStatus({
    fileId,
    tenantId,
    status,
    additionalMetadata = {},
  }: {
    fileId: string;
    tenantId: string;
    status: StorageStatusType;
    additionalMetadata?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await this.storageService.updateFileMetadata({
        id: fileId,
        tenantId,
        status,
        ...additionalMetadata,
      });
    } catch (error) {
      this.logger.error(
        `Failed to update file status to ${status} for ${fileId}: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  private validateFileIntegrity({
    originalMimeType,
    detectedMimeType,
  }: {
    originalMimeType: string;
    detectedMimeType: string;
  }): boolean {
    // Allow image conversion to WebP
    const isValidImageConversion =
      originalMimeType.startsWith('image/') && detectedMimeType === 'image/webp';

    // Allow video conversion to WebM and MP4
    const isValidVideoConversion =
      originalMimeType.startsWith('video/') &&
      (detectedMimeType === 'video/webm' || detectedMimeType === 'video/mp4');

    return (
      isValidImageConversion || isValidVideoConversion || detectedMimeType === originalMimeType
    );
  }

  private async performVirusScan({
    fileId,
    tenantId,
    processedFiles,
  }: {
    fileId: string;
    tenantId: string;
    processedFiles: ProcessedFileData[];
  }): Promise<boolean> {
    try {
      // Scan all processed file buffers
      for (const processedFile of processedFiles) {
        const scanResult = await this.virusScannerService.scanBuffer(processedFile.buffer);

        if (!scanResult.isClean) {
          this.logger.warn(
            `Virus detected in file ${fileId} (${processedFile.variant || 'original'}). Initiating cleanup.`,
          );

          // Prepare cleanup operations
          const cleanupTasks = [
            this.updateFileStatus({
              fileId,
              tenantId,
              status: StorageStatusType.Quarantined,
            }),
          ];

          // Only delete files if configured to do so
          if (this.appConfig.clamav.deleteInfectedFiles) {
            this.logger.debug(`Deleting infected files for ${fileId} from permanent storage`);
            for (const file of processedFiles) {
              cleanupTasks.push(
                this.deleteUploadedFile({
                  bucket: file.bucket,
                  bucketKey: file.bucketKey,
                  provider: file.provider,
                }),
              );
            }
          } else {
            this.logger.debug(
              `Keeping infected files for ${fileId} in permanent storage (delete disabled)`,
            );
          }

          // Execute cleanup operations
          await Promise.allSettled(cleanupTasks);

          return false;
        }
      }

      return true;
    } catch (error) {
      this.logger.error(`Virus scan failed for file ${fileId}: ${(error as Error).message}`);

      // On scan error, mark as failed and attempt cleanup
      const cleanupTasks = [
        this.updateFileStatus({
          fileId,
          tenantId,
          status: StorageStatusType.Failed,
        }),
      ];

      // Clean up all uploaded files
      for (const file of processedFiles) {
        cleanupTasks.push(
          this.deleteUploadedFile({
            bucket: file.bucket,
            bucketKey: file.bucketKey,
            provider: file.provider,
          }),
        );
      }

      await Promise.allSettled(cleanupTasks);

      return false;
    }
  }

  private async deleteUploadedFile({
    bucket,
    bucketKey,
    provider,
  }: {
    bucket: string;
    bucketKey: string;
    provider: StorageProviderType;
  }): Promise<void> {
    try {
      await this.fileService.deleteFile({
        bucket,
        key: bucketKey,
        providerType: provider,
      });
      this.logger.debug(`Successfully deleted uploaded file: ${bucketKey}`);
    } catch (error) {
      this.logger.error(`Failed to delete uploaded file ${bucketKey}: ${(error as Error).message}`);
      // Don't rethrow - this is cleanup, shouldn't fail the main process
    }
  }

  private async processFileForUpload({
    metadata,
    fileBuffer,
  }: {
    metadata: StorageServiceFileMetadataOutput;
    fileBuffer: Buffer;
  }): Promise<ProcessedFileData[]> {
    // Process file (convert images to WebP, videos to WebM and MP4)
    const processedFiles = await this.processFileBuffer({
      fileBuffer,
      mimeType: metadata.mimeType,
    });

    // Generate bucket keys for each processed file
    const processedFilesWithKeys = processedFiles.map((processedFile) => {
      const bucketKey = UploadUtils.generateBucketKey({
        fileId: metadata.id,
        extension: processedFile.extension,
      });

      if (!processedFile.bucket || !processedFile.provider) {
        throw new Error(
          `No permanent bucket mapping found for MIME type: ${processedFile.mimeType}`,
        );
      }

      return {
        ...processedFile,
        bucketKey,
      };
    });

    return processedFilesWithKeys;
  }

  private async cleanupStagingFile(
    metadata: StorageServiceFileMetadataOutput,
    force = false,
  ): Promise<void> {
    try {
      await this.fileService.deleteFile({
        bucket: metadata.bucketName,
        key: metadata.bucketKey,
        providerType: metadata.provider,
      });
      this.logger.debug(`Successfully deleted staging file: ${metadata.bucketKey}`);
    } catch (error) {
      const message = `Failed to delete staging file ${metadata.bucketKey}: ${(error as Error).message}`;
      if (force) {
        this.logger.error(message);
      } else {
        this.logger.warn(message);
      }
      // Don't rethrow for cleanup operations unless forced
      if (force) throw error;
    }
  }

  async process(job: Job<QueueServiceFileProcessingInput>): Promise<void> {
    const { fileId, tenantId } = job.data;
    this.logger.log(`Starting file processing: ${fileId}`);

    let metadata: StorageServiceFileMetadataOutput | null = null;
    let processedFiles: ProcessedFileData[] = [];
    let uploadCompleted = false;

    try {
      // 1. Fetch file metadata
      metadata = await this.storageService.getFileMetadataById({ id: fileId, tenantId });
      if (!metadata) {
        throw new Error(`File metadata not found: ${fileId}`);
      }

      // 2. Download file from staging
      const fileBuffer = await this.fileService.downloadFile({
        bucket: metadata.bucketName,
        key: metadata.bucketKey,
        providerType: metadata.provider,
      });

      // 3. Process file and prepare for permanent storage (convert images to WebP, videos to WebM and MP4)
      processedFiles = await this.processFileForUpload({ metadata, fileBuffer });

      // 4. Validate file integrity (MIME type consistency) for each processed file
      for (const processedFile of processedFiles) {
        const isIntegrityValid = this.validateFileIntegrity({
          originalMimeType: metadata.mimeType,
          detectedMimeType: processedFile.mimeType,
        });

        if (!isIntegrityValid) {
          this.logger.warn(
            `MIME type mismatch for file ${fileId} (${processedFile.variant || 'original'}): expected=${metadata.mimeType}, detected=${processedFile.mimeType}`,
          );
          await this.updateFileStatus({ fileId, tenantId, status: StorageStatusType.Failed });
          return;
        }
      }

      // 5. Upload all processed files to permanent storage BEFORE virus scanning
      for (const processedFile of processedFiles) {
        await this.fileService.uploadFile({
          bucket: processedFile.bucket,
          key: processedFile.bucketKey,
          file: processedFile.buffer,
          mimeType: processedFile.mimeType,
          providerType: processedFile.provider,
        });
      }
      uploadCompleted = true;

      // 6. Update file metadata with permanent storage details
      // Use the primary file (first one) for the main metadata
      const primaryFile = processedFiles[0];
      await this.updateFileStatus({
        fileId,
        tenantId,
        status: StorageStatusType.Processing,
        additionalMetadata: {
          bucketName: primaryFile.bucket,
          bucketKey: primaryFile.bucketKey,
          provider: primaryFile.provider,
          mimeType: primaryFile.mimeType,
          variants: processedFiles.map((file) => ({
            variant: file.variant || 'original',
            bucketName: file.bucket,
            bucketKey: file.bucketKey,
            mimeType: file.mimeType,
            provider: file.provider,
          })),
        },
      });

      // 7. Perform virus scan on all processed files
      const isVirusScanPassed = await this.performVirusScan({
        fileId,
        tenantId,
        processedFiles,
      });

      if (!isVirusScanPassed) {
        return; // Exit early - cleanup already handled in performVirusScan
      }

      // 8. Update file status to 'Completed' only after successful virus scan
      await this.updateFileStatus({ fileId, tenantId, status: StorageStatusType.Completed });

      // 9. Clean up staging file (non-blocking)
      await this.cleanupStagingFile(metadata);

      this.logger.log(
        `File processing completed successfully: ${fileId} with ${processedFiles.length} variants`,
      );
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.logger.error(
        `File processing failed for ${fileId}: ${errorMessage}`,
        (error as Error).stack,
      );

      // Cleanup logic on failure
      const cleanupTasks = [];

      // If upload was completed but processing failed, clean up all uploaded files
      if (uploadCompleted && processedFiles.length > 0) {
        for (const processedFile of processedFiles) {
          cleanupTasks.push(
            this.deleteUploadedFile({
              bucket: processedFile.bucket,
              bucketKey: processedFile.bucketKey,
              provider: processedFile.provider,
            }),
          );
        }
      }

      // Update status to failed
      cleanupTasks.push(
        this.updateFileStatus({ fileId, tenantId, status: StorageStatusType.Failed }),
      );

      // Force cleanup of staging file on error
      if (metadata) {
        cleanupTasks.push(this.cleanupStagingFile(metadata, true));
      }

      // Execute all cleanup tasks
      await Promise.allSettled(cleanupTasks);

      // Re-throw to mark job as failed in queue
      throw new Error(`File processing failed for ${fileId}: ${errorMessage}`);
    } finally {
      // Clear buffer references for garbage collection
      for (const processedFile of processedFiles) {
        if (processedFile.buffer) {
          processedFile.buffer = undefined;
        }
      }
      processedFiles = [];
    }
  }
}
