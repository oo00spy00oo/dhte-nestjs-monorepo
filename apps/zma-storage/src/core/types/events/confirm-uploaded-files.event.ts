export class ConfirmUploadedFilesEvent {
  userId: string;

  fileId: string;

  mimeType: string;

  extension: string;

  key: string;

  bucket: string;
}
