import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { AiServiceTranslateLanguageEnum } from '../types/enums/omni-ai.type';

@InputType({ description: 'Analyze Input' })
export class AnalyzeInput {
  @Field(() => String, { description: 'Original Text' })
  @IsString()
  @IsNotEmpty()
  originalText!: string;

  @Field(() => String, { description: 'Comparison Text' })
  @IsString()
  @IsNotEmpty()
  comparisonText!: string;

  // @Field(() => String, { description: 'Language' })
  // @IsString()
  // @IsNotEmpty()
  // lang!: string;

  // @Field(() => String, { description: 'Level' })
  // @IsString()
  // @IsNotEmpty()
  // level!: string;
}

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
