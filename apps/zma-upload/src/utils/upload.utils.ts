import { DateUtils, IdUtils } from '@zma-nestjs-monorepo/zma-utils';

// Image MIME Types
export const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml',
  'image/tiff',
  'image/x-icon',
  'image/heif',
  'image/heic',
] as const);

// Audio MIME Types
export const AUDIO_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/ogg',
  'audio/flac',
  'audio/aac',
  'audio/x-aac',
  'audio/m4a',
  'audio/x-m4a',
  'audio/x-ms-wma',
] as const);

// Video MIME Types
export const VIDEO_MIME_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/x-ms-wmv',
  'video/ogg',
  'video/quicktime',
] as const);

// Document MIME Types
export const DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/html',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
] as const);

export class UploadUtils {
  static generateBucketKey = ({
    fileId,
    extension,
  }: {
    fileId: string;
    extension: string;
  }): string => {
    const createdDate = IdUtils.extractTimestampFromUUIDv7(fileId);
    const formattedDate = DateUtils.dayjsWrapper(createdDate).format('YYYY/MM/DD/HH');
    return `${formattedDate}/${fileId}.${extension}`;
  };
}
