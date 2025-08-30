export enum StorageStatusType {
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Quarantined = 'QUARANTINED',
}

export enum StorageProviderType {
  S3 = 'S3',
  R2 = 'R2',
}
