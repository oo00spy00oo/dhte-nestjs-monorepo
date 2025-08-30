import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProviderType } from '@zma-nestjs-monorepo/zma-types';

import { appConfiguration } from '../../configuration';
import { FileServiceGeneralInput, FileServiceUploadInput } from '../../core/inputs';
import { FileServiceGetPermanentBucketOutput } from '../../core/outputs/upload.output';

@Injectable()
export class FileService {
  private readonly clients: Record<string, S3Client>;
  private readonly appConfig = appConfiguration(this.configService);

  constructor(private readonly configService: ConfigService) {
    this.clients = {
      stagingR2: this.createS3Client({
        accountId: this.appConfig.r2.accountId,
        accessKeyId: this.appConfig.r2.stagingAccessKeyId,
        secretAccessKey: this.appConfig.r2.stagingSecretAccessKey,
        provider: StorageProviderType.R2,
      }),
      stagingS3: this.createS3Client({
        accountId: this.appConfig.s3.accountId,
        accessKeyId: this.appConfig.s3.stagingAccessKeyId,
        secretAccessKey: this.appConfig.s3.stagingSecretAccessKey,
        provider: StorageProviderType.S3,
      }),
      permanentR2: this.createS3Client({
        accountId: this.appConfig.r2.accountId,
        accessKeyId: this.appConfig.r2.permanentAccessKeyId,
        secretAccessKey: this.appConfig.r2.permanentSecretAccessKey,
        provider: StorageProviderType.R2,
      }),
      permanentS3: this.createS3Client({
        accountId: this.appConfig.s3.accountId,
        accessKeyId: this.appConfig.s3.permanentAccessKeyId,
        secretAccessKey: this.appConfig.s3.permanentSecretAccessKey,
        provider: StorageProviderType.S3,
      }),
    };
  }

  private createS3Client({
    accountId,
    accessKeyId,
    secretAccessKey,
    provider,
  }: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    provider: StorageProviderType;
  }): S3Client {
    const endpoint =
      provider === StorageProviderType.R2
        ? `https://${accountId}.r2.cloudflarestorage.com`
        : `https://${accountId}.s3.amazonaws.com`;

    return new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  private isPermanentBucket(bucket: string): boolean {
    const { image, video, audio, document } = this.appConfig.buckets;
    return [image.name, video.name, audio.name, document.name].includes(bucket);
  }

  private getClient({
    bucket,
    providerType,
  }: {
    bucket: string;
    providerType: StorageProviderType;
  }): S3Client {
    if (providerType === StorageProviderType.R2) {
      return this.isPermanentBucket(bucket) ? this.clients.permanentR2 : this.clients.stagingR2;
    } else {
      return this.isPermanentBucket(bucket) ? this.clients.permanentS3 : this.clients.stagingS3;
    }
  }

  getPermanentBucketForMimeType(mimeType: string): FileServiceGetPermanentBucketOutput {
    const typeMap: Record<string, keyof typeof this.appConfig.buckets> = {
      'image/': 'image',
      'video/': 'video',
      'audio/': 'audio',
    };

    const matchedType = Object.entries(typeMap).find(([prefix]) => mimeType.startsWith(prefix));
    const bucketKey = matchedType?.[1] ?? 'document';

    const bucketConfig = this.appConfig.buckets[bucketKey];

    return {
      bucket: bucketConfig.name,
      provider: bucketConfig.provider as StorageProviderType,
    };
  }

  async putObjectPresignedUrl(input: FileServiceGeneralInput) {
    const { bucket, key, mimeType, providerType } = input;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: mimeType,
    });
    const client = this.getClient({ bucket, providerType });
    return getSignedUrl(client, command, { expiresIn: 60 * 60 });
  }

  async getObjectPresignedUrl(input: FileServiceGeneralInput) {
    const { bucket, key, providerType } = input;
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const client = this.getClient({ bucket, providerType });

    return getSignedUrl(client, command, { expiresIn: 60 * 60 });
  }

  async downloadFile(input: FileServiceGeneralInput) {
    const { bucket, key, providerType } = input;
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const client = this.getClient({ bucket, providerType });

    const response = await client.send(command);

    if (!response.Body) {
      throw new Error('File not found or empty');
    }

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of response.Body as ReadableStream) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  async deleteFile(input: FileServiceGeneralInput) {
    const { bucket, key, providerType } = input;
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const client = this.getClient({ bucket, providerType });

    return client.send(command);
  }

  async uploadFile(input: FileServiceUploadInput) {
    const { bucket, key, file, mimeType, providerType } = input;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
    });

    const client = this.getClient({ bucket, providerType });

    return client.send(command);
  }

  async checkFileExists(input: FileServiceGeneralInput): Promise<boolean> {
    const { bucket, key, providerType } = input;
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const client = this.getClient({ bucket, providerType });

    try {
      await client.send(command);
      return true;
    } catch (err) {
      const notFoundCodes = ['NotFound', 'NoSuchKey'];
      const statusCode = err.$metadata?.httpStatusCode;

      if (notFoundCodes.includes(err.name) || statusCode === 404) {
        return false;
      }

      throw new Error(`Error checking file existence: ${err.message}`);
    }
  }
}
