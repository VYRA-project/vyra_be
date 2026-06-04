import { IsInt, IsNumber, IsString } from 'class-validator';

export class SubmitScenarioDto {
  @IsInt()
  elementId: number;

  @IsString()
  name: string;

  @IsNumber()
  simulatedTemp: number;
}