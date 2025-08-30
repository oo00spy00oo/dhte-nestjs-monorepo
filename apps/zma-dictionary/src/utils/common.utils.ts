import { FileUtils } from '@zma-nestjs-monorepo/zma-utils';

export class CommonUtils {
  static chunkArray<T>({ arr, size }: { arr: T[]; size: number }): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  static generateS3Key({
    mimeType,
    word,
    partOfSpeech,
    dialect,
    isCommonAsset = false,
  }: {
    mimeType: string;
    word: string;
    partOfSpeech: string;
    dialect?: string;
    isCommonAsset?: boolean;
  }): string {
    const ext = FileUtils.mimeTypeToExtension(mimeType);
    if (!ext) throw new Error('Unsupported file type');
    if (isCommonAsset && mimeType.startsWith('video/')) {
      return `videos/words/${dialect}-${partOfSpeech}-${word}.${ext}`;
    }
    if (mimeType.startsWith('image/')) return `${partOfSpeech.toLowerCase()}/${word}.${ext}`;
    if (!dialect) throw new Error('Dialect is required for audio');
    return `${dialect.toLowerCase()}/${dialect}-${partOfSpeech}-${word}.${ext}`;
  }
}
