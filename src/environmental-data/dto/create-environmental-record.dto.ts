import { IsNumber, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEnvironmentalRecordDto {
  @IsInt()
  @IsNotEmpty()
  elementId !: number;

  @IsOptional() 
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  humidity?: number;

  @IsOptional()
  @IsInt()
  traffic?: number;

  @IsOptional()
  @IsInt()
  co2?: number;
}