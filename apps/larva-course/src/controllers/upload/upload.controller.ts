import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '@zma-nestjs-monorepo/zma-decorators';
import { AuthenticatedUser } from '@zma-nestjs-monorepo/zma-types';
import { Express } from 'express';

import { UploadOutput } from '../../core/outputs';
import { UploadUseCase } from '../../use-cases/upload/upload.use-case';

@Controller('upload')
export class UploadController {
  constructor(private uploadUseCase: UploadUseCase) {}

  @Post('user-audio')
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserAudio(
    @UploadedFile()
    file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UploadOutput> {
    return this.uploadUseCase.uploadAudio({ file, userId: user.id });
  }
}
