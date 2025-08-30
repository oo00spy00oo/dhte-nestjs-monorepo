import { IsNotEmpty, IsString } from 'class-validator';

export class AiServiceText2SpeechOutput {
  @IsString()
  @IsNotEmpty()
  url!: string;
}

export class AiServiceLipSyncOutput {
  @IsString()
  @IsNotEmpty()
  url!: string;
}

export class AiServiceTranslateOutput {
  @IsString()
  @IsNotEmpty()
  message!: string;
}
