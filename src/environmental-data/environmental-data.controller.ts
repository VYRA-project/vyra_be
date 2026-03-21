// src/environmental-data/environmental-data.controller.ts
import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { EnvironmentalDataService } from './environmental-data.service';
import { CreateEnvironmentalRecordDto } from './create-environmental-record.dto';


@Controller('environmental-data')
export class EnvironmentalDataController {
  constructor(private readonly environmentalDataService: EnvironmentalDataService) {}

  @Post('upload')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async upload(@Body() dto: CreateEnvironmentalRecordDto) {
    return this.environmentalDataService.ingestData(dto);
  }
}