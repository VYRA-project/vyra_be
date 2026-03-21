// src/environmental-data/dto/create-environmental-record.dto.ts
import { IsNumber, IsInt, IsNotEmpty } from 'class-validator';

export class CreateEnvironmentalRecordDto {
  @IsInt()
  @IsNotEmpty()
  elementId: number; // Legătura cu CampusElement (1, 2 sau 3)

  @IsNumber()
  temperature: number; // Din Field 1

  @IsNumber()
  humidity: number;    // Din Field 2

  @IsInt()
  traffic: number;     // Din Field 3

  @IsInt()
  co2: number;         // Din Field 4
}