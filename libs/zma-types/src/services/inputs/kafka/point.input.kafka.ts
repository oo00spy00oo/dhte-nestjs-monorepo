import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PointServiceUserPointBalanceUpdatedEventKafkaInput {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsNumber()
  @IsOptional()
  totalPoints!: number;

  @IsString()
  @IsNotEmpty()
  createdAt?: string;
}
