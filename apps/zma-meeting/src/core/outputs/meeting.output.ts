import { Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@ObjectType()
export class MeetingServiceCreateRoomGqlOutput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  code!: string;
}
