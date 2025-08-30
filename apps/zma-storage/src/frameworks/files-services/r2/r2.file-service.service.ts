import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

@Injectable()
export class R2FileService {
  private readonly S3_CLIENT = S3;

  async putObjectPresignedUrl({
    bucket,
    key,
    mimeType,
  }: {
    bucket: string;
    key: string;
    mimeType: string;
  }) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: mimeType,
    });

    return getSignedUrl(this.S3_CLIENT, command, { expiresIn: 60 * 60 });
  }

  async getObjectPresignedUrl({ bucket, key }: { bucket: string; key: string }) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return getSignedUrl(this.S3_CLIENT, command, { expiresIn: 60 * 60 });
  }

  async downloadFile({ bucket, key }: { bucket: string; key: string }) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await this.S3_CLIENT.send(command);

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

  async deleteFile({ bucket, key }: { bucket: string; key: string }) {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return this.S3_CLIENT.send(command);
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
  }) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
    });

    return this.S3_CLIENT.send(command);
  }
}
