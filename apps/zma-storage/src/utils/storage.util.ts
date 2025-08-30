import { DateUtils, IdUtils } from '@zma-nestjs-monorepo/zma-utils';

export class StorageUtils {
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
