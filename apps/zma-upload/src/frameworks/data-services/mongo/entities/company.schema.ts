import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IdUtils } from '@zma-nestjs-monorepo/zma-utils';
import { Document, SchemaTypes } from 'mongoose';

export type CompanyDocument = CompanyEntity & Document;

@NestSchema({
  collection: 'companies',
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  timestamps: true,
})
export class CompanyEntity {
  @Prop({ type: SchemaTypes.UUID, default: () => IdUtils.uuidv7() })
  _id?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  logoUrl?: string;

  @Prop()
  websiteUrl?: string;

  @Prop()
  address?: string;

  @Prop()
  workingHour?: string;

  @Prop()
  lunchBreak?: string;

  @Prop({ default: [] })
  locations: string[];

  @Prop()
  description?: string;

  @Prop({ default: 0 })
  totalEmployees?: number;

  @Prop({ default: true })
  isEnabled: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const CompanySchema = SchemaFactory.createForClass(CompanyEntity);
