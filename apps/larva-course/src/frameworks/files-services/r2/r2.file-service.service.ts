import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { appConfiguration } from '../../../configuration';

@Injectable()
export class R2FileService {
  private readonly s3Client: S3Client;
  constructor(private configService: ConfigService) {
    const { r2 } = appConfiguration(this.configService);
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${r2.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2.accessKeyId,
        secretAccessKey: r2.secretAccessKey,
      },
    });
  }

  async fileExistsInS3({ bucket, key }: { bucket: string; key: string }): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({ Bucket: bucket, Key: key });
      await this.s3Client.send(command);
      return true;
    } catch (err) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) return false;
      if (err.name === 'NoSuchKey') return false;
      throw err;
    }
  }

  async deleteFile({ bucket, key }: { bucket: string; key: string }) {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return this.s3Client.send(command);
  }

  async uploadFile({
    bucket,
    key,
    file,
    mimeType,
  }: {
    bucket: string;
    key: string;
    mimeType: string;
    file: Buffer | Uint8Array | Blob | string | ReadableStream;
  }): Promise<PutObjectCommandOutput> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
    });
    return this.s3Client.send(command);
  }
}
