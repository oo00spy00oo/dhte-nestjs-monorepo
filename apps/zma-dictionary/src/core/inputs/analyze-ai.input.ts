import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { AiServiceTranslateLanguageEnum } from '../types/enums';

export class AiServiceText2SpeechInput {
  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class AiServiceLipSyncInput {
  @IsString()
  @IsNotEmpty()
  audioUrl!: string;

  @IsString()
  @IsNotEmpty()
  videoUrl!: string;
}

export class AiServiceTranslateInput {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsEnum(AiServiceTranslateLanguageEnum)
  @IsNotEmpty()
  language!: AiServiceTranslateLanguageEnum;
}
