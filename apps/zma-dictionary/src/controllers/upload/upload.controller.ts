import { Controller, Param, Patch, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { DictionaryDialectEnum } from '../../core/types';
import { UploadUseCase } from '../../use-cases/upload/upload.use-case';

@Controller('upload')
export class UploadController {
  constructor(private uploadUseCase: UploadUseCase) {}

  @Patch('dictionary/:id/assets')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'audioUS', maxCount: 1 },
      { name: 'audioUK', maxCount: 1 },
    ]),
  )
  async uploadWordAssets(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      audioUS?: Express.Multer.File[];
      audioUK?: Express.Multer.File[];
    },
  ): Promise<boolean> {
    const image = files.image?.[0];
    const audios: { region: DictionaryDialectEnum; file: Express.Multer.File }[] = [];

    if (files.audioUS?.[0])
      audios.push({ region: DictionaryDialectEnum.US, file: files.audioUS[0] });
    if (files.audioUK?.[0])
      audios.push({ region: DictionaryDialectEnum.UK, file: files.audioUK[0] });

    return this.uploadUseCase.uploadDictionaryAssets({
      image,
      audios,
      id,
    });
  }
}
