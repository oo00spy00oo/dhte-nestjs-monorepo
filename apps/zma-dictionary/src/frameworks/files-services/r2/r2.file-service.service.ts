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

interface S3Params {
  bucket: string;
  key: string;
  isDictionary?: boolean; // default handled in code
}

@Injectable()
export class R2FileService {
  private readonly dictionaryS3Client: S3Client;
  private readonly courseS3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    const { r2 } = appConfiguration(this.configService);

    const createClient = (accessKeyId: string, secretAccessKey: string) =>
      new S3Client({
        region: 'auto',
        endpoint: `https://${r2.accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });

    this.dictionaryS3Client = createClient(r2.dictionaryAccessKeyId, r2.dictionarySecretAccessKey);
    this.courseS3Client = createClient(r2.courseAccessKeyId, r2.courseSecretAccessKey);
  }

  private getClient(isDictionary = true): S3Client {
    return isDictionary ? this.dictionaryS3Client : this.courseS3Client;
  }

  async fileExistsInS3({ bucket, key, isDictionary = true }: S3Params): Promise<boolean> {
    try {
      await this.getClient(isDictionary).send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return true;
    } catch (err) {
      if (['NotFound', 'NoSuchKey'].includes(err.name) || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw err;
    }
  }

  async deleteFile({ bucket, key, isDictionary = true }: S3Params) {
    return this.getClient(isDictionary).send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }

  async uploadFile({
    bucket,
    key,
    file,
    mimeType,
    isDictionary = true,
  }: S3Params & {
    file: Buffer | Uint8Array | Blob | string | ReadableStream;
    mimeType: string;
  }): Promise<PutObjectCommandOutput> {
    return this.getClient(isDictionary).send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file,
        ContentType: mimeType,
      }),
    );
  }
}
