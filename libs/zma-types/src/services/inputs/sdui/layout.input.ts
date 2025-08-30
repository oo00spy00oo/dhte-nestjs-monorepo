import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import { FeatureEnum } from '../../../enums';

registerEnumType(FeatureEnum, {
  name: 'SduiFeatureEnum',
  description: 'Available feature codes the client can use',
});

@InputType()
export class SduiServiceThemeInput {
  @IsOptional()
  @IsString()
  @Field({ nullable: false })
  themeName?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: false })
  color?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: false })
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: false })
  fontFamily?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: false })
  fontSize?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: false })
  buttonStyle?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: false })
  primaryColor?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: false })
  secondaryColor?: string;
}

@InputType()
export class SduiServiceActionInput {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  type?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  target?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  route?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  value?: string;
}

@InputType()
export class SduiServiceModuleInput {
  @IsOptional()
  @Field(() => FeatureEnum, { nullable: true })
  featureCode?: FeatureEnum;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  icon?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  title?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SduiServiceActionInput)
  @Field(() => SduiServiceActionInput, { nullable: false })
  action?: SduiServiceActionInput;

  @IsOptional()
  @Field(() => Boolean, { defaultValue: true })
  isShow?: boolean;
}

@InputType()
export class SduiServiceBottomNavBarItemInput {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  label?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  icon?: string;

  @ValidateNested()
  @Type(() => SduiServiceActionInput)
  @Field(() => SduiServiceActionInput, { nullable: true })
  action?: SduiServiceActionInput;
}

@InputType()
export class SduiServiceBannerComponentInput {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  imageUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SduiServiceActionInput)
  @Field(() => SduiServiceActionInput, { nullable: true })
  action?: SduiServiceActionInput;
}

@InputType()
export class SduiServiceBottomNavBarComponentInput {
  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  selectedIndex?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SduiServiceBottomNavBarItemInput)
  @Field(() => [SduiServiceBottomNavBarItemInput], { nullable: false })
  items?: SduiServiceBottomNavBarItemInput[];
}

@InputType()
export class SduiServiceComponentInput {
  @IsOptional()
  @ValidateNested()
  @Field(() => SduiServiceBannerComponentInput, { nullable: false })
  banner?: SduiServiceBannerComponentInput;

  @IsOptional()
  @ValidateNested()
  @Field(() => SduiServiceBottomNavBarComponentInput, { nullable: false })
  bottomNavBar?: SduiServiceBottomNavBarComponentInput;
}

@InputType()
export class SduiServiceCreateLayoutGqlInput {
  @IsString()
  @Field({ nullable: false })
  layoutId?: string;

  @Field(() => SduiServiceThemeInput, { nullable: false })
  @IsOptional()
  theme?: SduiServiceThemeInput;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SduiServiceModuleInput)
  @Field(() => [SduiServiceModuleInput], { nullable: false })
  modules?: SduiServiceModuleInput[];

  @IsOptional()
  @Field(() => SduiServiceComponentInput, { nullable: false })
  @Type(() => SduiServiceComponentInput)
  components?: SduiServiceComponentInput;
}

@InputType()
export class SduiServiceUpdateLayoutGqlInput {
  @Field(() => SduiServiceThemeInput, { nullable: false })
  @IsOptional()
  theme?: SduiServiceThemeInput;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SduiServiceModuleInput)
  @Field(() => [SduiServiceModuleInput], { nullable: false })
  modules?: SduiServiceModuleInput[];

  @IsOptional()
  @Field(() => SduiServiceComponentInput, { nullable: false })
  @Type(() => SduiServiceComponentInput)
  components?: SduiServiceComponentInput;
}

@InputType()
export class SduiServiceCustomFieldInput {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  fieldName?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  fieldType?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  fieldValue?: string;
}

@InputType()
export class SduiServiceUpdateComponentInput {
  @IsOptional()
  @ValidateNested()
  @Field(() => SduiServiceBannerComponentInput, { nullable: false })
  banner?: SduiServiceBannerComponentInput;
}
@InputType()
export class SduiServiceUpdateTenantLayoutGqlInput {
  @IsOptional()
  @Field(() => SduiServiceUpdateComponentInput, { nullable: false })
  @Type(() => SduiServiceUpdateComponentInput)
  components?: SduiServiceUpdateComponentInput;

  @IsOptional()
  @Field(() => [SduiServiceCustomFieldInput], { nullable: false })
  @Type(() => SduiServiceCustomFieldInput)
  customFields?: SduiServiceCustomFieldInput[];
}

export class SduiServiceCreateLayoutInput extends SduiServiceCreateLayoutGqlInput {
  tenantId!: string;
}

export class SduiServiceUpdateLayoutInput extends SduiServiceUpdateLayoutGqlInput {}

export class SduiServiceSearchLayoutInput extends SduiServiceCreateLayoutGqlInput {}

export class SduiServiceUpdateTenantLayoutInput extends SduiServiceUpdateTenantLayoutGqlInput {}
