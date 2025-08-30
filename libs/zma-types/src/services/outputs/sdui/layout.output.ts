import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';

@ObjectType()
export class SduiServiceThemeOutput {
  @Field({ nullable: true })
  themeName?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  backgroundColor?: string;

  @Field({ nullable: true })
  fontFamily?: string;

  @Field({ nullable: true })
  fontSize?: string;

  @Field({ nullable: true })
  buttonStyle?: string;

  @Field({ nullable: true })
  primaryColor?: string;

  @Field({ nullable: true })
  secondaryColor?: string;
}

@ObjectType()
export class SduiServiceActionOutput {
  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  target?: string;

  @Field({ nullable: true })
  route?: string;

  @Field({ nullable: true })
  value?: string;
}

@ObjectType()
export class SduiServiceModuleOutput {
  @Field({ nullable: true })
  featureCode?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  isShow?: boolean;

  @Type(() => SduiServiceActionOutput)
  @Field(() => SduiServiceActionOutput, { nullable: true })
  action?: SduiServiceActionOutput;
}

@ObjectType()
export class SduiServiceBottomNavBarItemOutput {
  @Field({ nullable: true })
  label?: string;

  @Field({ nullable: true })
  icon?: string;

  @Type(() => SduiServiceActionOutput)
  @Field(() => SduiServiceActionOutput, { nullable: true })
  action?: SduiServiceActionOutput;
}

@ObjectType()
export class SduiServiceBannerComponentOutput {
  @Field({ nullable: true })
  imageUrl?: string;

  @Type(() => SduiServiceActionOutput)
  @Field(() => SduiServiceActionOutput, { nullable: true })
  action?: SduiServiceActionOutput;
}

@ObjectType()
export class SduiServiceBottomNavBarComponentOutput {
  @Field({ nullable: true })
  selectedIndex?: number;

  @Type(() => SduiServiceBottomNavBarItemOutput)
  @Field(() => [SduiServiceBottomNavBarItemOutput], { nullable: true })
  items?: SduiServiceBottomNavBarItemOutput[];
}

@ObjectType()
export class SduiServiceComponentOutput {
  @Field(() => SduiServiceBannerComponentOutput, { nullable: true })
  banner?: SduiServiceBannerComponentOutput;

  @Field(() => SduiServiceBottomNavBarComponentOutput, { nullable: true })
  bottomNavBar?: SduiServiceBottomNavBarComponentOutput;
}

@ObjectType()
export class SduiServiceCustomFieldOutput {
  @Field({ nullable: true })
  fieldName?: string;

  @Field({ nullable: true })
  fieldType?: string;

  @Field({ nullable: true })
  fieldValue?: string;
}

@ObjectType()
export class SduiServiceLayoutGqlOutput {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  tenantId?: string;

  @Field({ nullable: true })
  layoutId?: string;

  @Field(() => SduiServiceThemeOutput, { nullable: true })
  theme?: SduiServiceThemeOutput;

  @Type(() => SduiServiceModuleOutput)
  @Field(() => [SduiServiceModuleOutput], { nullable: true })
  modules?: SduiServiceModuleOutput[];

  @Field(() => SduiServiceComponentOutput, { nullable: true })
  @Type(() => SduiServiceComponentOutput)
  components?: SduiServiceComponentOutput;

  @Type(() => SduiServiceCustomFieldOutput)
  @Field(() => [SduiServiceCustomFieldOutput], { nullable: true })
  customFields?: SduiServiceCustomFieldOutput[];
}

export class SduiServiceLayoutOutput extends SduiServiceLayoutGqlOutput {}
