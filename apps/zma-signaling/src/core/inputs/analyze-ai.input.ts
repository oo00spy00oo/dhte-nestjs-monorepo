import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { AiServiceTranslateLanguageEnum } from '../types/enums';

export class AiServiceTranslateInput {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsEnum(AiServiceTranslateLanguageEnum)
  @IsNotEmpty()
  language!: AiServiceTranslateLanguageEnum;
}
