import * as crypto from 'crypto';

import * as _ from 'lodash';

import { types } from './types';

const mimeTypeToExtensionMap: { [key: string]: string } = {
  // Images
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/svg+xml': 'svg',
  'image/tiff': 'tiff',
  'image/x-icon': 'ico',
  'image/heif': 'heif',
  'image/heic': 'heic',

  // Audio
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/flac': 'flac',
  'audio/aac': 'aac',
  'audio/x-aac': 'aac',
  'audio/m4a': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/x-ms-wma': 'wma',

  // Video
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/x-ms-wmv': 'wmv',
  'video/ogg': 'ogv',
  'video/quicktime': 'mov',
  'video/x-msvideo': 'avi',
  'video/mpeg': 'mpg',
  'video/x-matroska': 'mkv',
  'video/3gpp': '3gp',
  'video/3gpp2': '3g2',
  'video/x-flv': 'flv',
  'video/x-m4v': 'm4v',
  'video/mp2t': 'ts',
  'video/divx': 'divx',
  'video/x-f4v': 'f4v',

  // Documents
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/html': 'html',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',

  // Archives
  'application/zip': 'zip',
  'application/x-tar': 'tar',
  'application/x-gzip': 'gz',

  // Web/Other
  'application/json': 'json',
  'application/javascript': 'js',
  'application/css': 'css',
};

export class FileUtils {
  static getMime = (name: string) => {
    const binaryoctet = 'binary/octet-stream';
    const value = types[name.substring(name.lastIndexOf('.')) as keyof typeof types];
    return value || { type: binaryoctet, name: 'Default' };
  };

  static mimeTypeToExtension(mimeType: string): string | null {
    return mimeTypeToExtensionMap[mimeType] || null;
  }

  static getFileExtension(fileName: string): string {
    const extension = _.toLower(fileName.split('.').pop());
    return extension || '';
  }

  static getMimeTypeFromFileName(fileName: string): { type: string; name: string } {
    return this.getMime(fileName);
  }

  static getMimeTypeFromBuffer(buffer: Buffer): { type: string; name: string; extension: string } {
    const extension = this.detectExtension(buffer).toLowerCase();
    return { ...this.getMimeTypeFromFileName(`default.${extension}`), extension };
  }

  static hashFileContent(buffer: Buffer, algorithm = 'sha256'): string {
    const hash = crypto.createHash(algorithm);
    hash.update(buffer);
    return hash.digest('hex');
  }

  static compareExtensions(ext1: string, ext2: string): boolean {
    if (!ext1 || !ext2) return false;

    // Normalize extensions by removing dots and converting to lowercase
    const normalize = (ext: string) =>
      ext.startsWith('.') ? ext.slice(1).toLowerCase() : ext.toLowerCase();

    const normalizedExt1 = normalize(ext1);
    const normalizedExt2 = normalize(ext2);

    // Direct match
    if (normalizedExt1 === normalizedExt2) return true;

    // Handle known equivalents
    const equivalents: { [key: string]: string[] } = {
      jpg: ['jpg', 'jpeg', 'jpe', 'jfif'],
      jpeg: ['jpg', 'jpeg', 'jpe', 'jfif'],
      tif: ['tif', 'tiff'],
      tiff: ['tif', 'tiff'],
      htm: ['htm', 'html'],
      html: ['htm', 'html'],
      mp4: ['mp4', 'm4v'],
      m4v: ['mp4', 'm4v'],
      mov: ['mov', 'qt'],
      qt: ['mov', 'qt'],
      doc: ['doc', 'docx'],
      docx: ['doc', 'docx'],
      xls: ['xls', 'xlsx'],
      xlsx: ['xls', 'xlsx'],
      ppt: ['ppt', 'pptx'],
      pptx: ['ppt', 'pptx'],
    };

    // Check if either extension is in the equivalents map
    if (equivalents[normalizedExt1]?.includes(normalizedExt2)) return true;
    if (equivalents[normalizedExt2]?.includes(normalizedExt1)) return true;

    return false;
  }

  static detectExtension(buffer: Buffer): string {
    if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 8) {
      return 'Unknown';
    }

    const firstFourBytes = buffer.subarray(0, 4).toString('hex');
    const firstEightBytes = buffer.subarray(0, 8).toString('hex');
    const signatureBytes = Math.min(buffer.length, 512);
    const signature = buffer.subarray(0, signatureBytes).toString('hex');

    return this.identifyFileType(signature, firstFourBytes, firstEightBytes, buffer);
  }

  static buildImageUrl(baseUrl: string, imagePath: string): string {
    if (!imagePath || !baseUrl) return imagePath || '';

    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    return `${cleanBaseUrl}/${cleanPath}`;
  }

  /*
  DO NOT CHANGE THE ORDER OF THE SIGNATURES
  */
  private static identifyFileType(
    signature: string,
    firstFourBytes: string,
    firstEightBytes: string,
    buffer: Buffer,
  ): string {
    // Normalize input
    signature = signature.toLowerCase();
    firstFourBytes = firstFourBytes.toLowerCase();
    firstEightBytes = firstEightBytes.toLowerCase();

    const signatures: { [key: string]: string } = {
      // Images
      '89504e470d0a1a0a': 'PNG', //  pragma: allowlist secret
      ffd8ffe000104a46: 'JPEG', //  pragma: allowlist secret
      ffd8ffe1: 'JPEG', //  pragma: allowlist secret
      ffd8ffdb: 'JPEG', //  pragma: allowlist secret
      ffd8ffee: 'JPEG', //  pragma: allowlist secret
      ffd8ffe: 'JPEG', //  pragma: allowlist secret
      '47494638': 'GIF', //  pragma: allowlist secret
      '47494638397a': 'GIF', //  pragma: allowlist secret
      '47494638396a': 'GIF', //  pragma: allowlist secret
      '424d': 'BMP', //  pragma: allowlist secret
      '52494646': 'WEBP', //  pragma: allowlist secret
      '00000100': 'ICO', //  pragma: allowlist secret
      '49492a00': 'TIFF', //  pragma: allowlist secret
      '4d4d002a': 'TIFF', //  pragma: allowlist secret
      '38425053': 'PSD', //  pragma: allowlist secret

      // Audio
      '494433': 'MP3', //  pragma: allowlist secret (ID3)
      fff3: 'MP3', //  pragma: allowlist secret
      fffb: 'MP3', //  pragma: allowlist secret
      '464f524d': 'AIFF', //  pragma: allowlist secret

      // Video
      '00000020': 'MP4', //  pragma: allowlist secret
      '00000018': 'MP4', //  pragma: allowlist secret
      '1a45dfa3': 'MKV', //  pragma: allowlist secret
      '000001ba': 'MPEG', //  pragma: allowlist secret
      '000001b3': 'MPEG', //  pragma: allowlist secret

      // Documents & Archives
      '25504446': 'PDF', //  pragma: allowlist secret
      d0cf11e0a1b11ae1: 'DOC', //  pragma: allowlist secret
      '504b0304': 'ZIP', //  pragma: allowlist secret

      // Executables
      '4d5a': 'EXE', //  pragma: allowlist secret
    };

    // DOCX special case: ZIP file containing "word/"
    if (firstEightBytes === '504b030414000600' && buffer.includes(Buffer.from('word/'))) {
      return 'DOCX';
    }

    if (signatures[firstFourBytes]) {
      return signatures[firstFourBytes];
    }

    if (signatures[firstEightBytes]) {
      return signatures[firstEightBytes];
    }

    const sorted = Object.entries(signatures).sort((a, b) => b[0].length - a[0].length);
    for (const [key, ext] of sorted) {
      if (signature.startsWith(key)) {
        return ext;
      }
    }

    return 'Unknown';
  }
}
