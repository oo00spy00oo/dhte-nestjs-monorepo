import { Schema as NestSchema, Prop } from '@nestjs/mongoose';
import { SurveyQuestionType, SurveyUiTemplate } from '@zma-nestjs-monorepo/zma-types';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { SchemaTypes } from 'mongoose';

@NestSchema({ _id: false })
export class QuestionEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  questionId?: string;

  @Prop({ type: SchemaTypes.Number, required: true })
  index: number;

  @Prop({ type: SchemaTypes.String, required: true })
  text: string;

  @Prop({ type: SchemaTypes.String, enum: SurveyQuestionType, required: true })
  type: SurveyQuestionType;

  @Prop({ type: SchemaTypes.Boolean, default: true })
  isActive?: boolean;

  @Prop({ type: SchemaTypes.Boolean, required: true })
  isRequired: boolean;

  @Prop({ type: SchemaTypes.Array, default: [] })
  options?: string[];

  @Prop({ type: SchemaTypes.Number })
  minValue?: number;

  @Prop({ type: SchemaTypes.Number })
  maxValue?: number;

  @Prop({ type: SchemaTypes.String, enum: SurveyUiTemplate, required: true })
  uiTemplate: SurveyUiTemplate;

  @Prop({ type: SchemaTypes.String })
  actionLabel?: string;

  @Prop({ type: SchemaTypes.String })
  actionUrl?: string;
}
