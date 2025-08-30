import { IsNotEmpty, IsString } from 'class-validator';

export class AiServiceTranslateOutput {
  @IsString()
  @IsNotEmpty()
  message!: string;
}
