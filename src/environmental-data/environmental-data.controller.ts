// src/environmental-data/environmental-data.controller.ts
import { Controller, Post, Body, UsePipes, ValidationPipe, Get } from '@nestjs/common';
import { EnvironmentalDataService } from './environmental-data.service';
import { CreateEnvironmentalRecordDto } from './dto/create-environmental-record.dto';
import { EnvironmentalDataGateway } from './environmental-data.gateway';


@Controller('environmental-data')
export class EnvironmentalDataController {
  constructor(private readonly environmentalDataService: EnvironmentalDataService,
    private readonly gateway: EnvironmentalDataGateway
  ) {}

  @Post('upload')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async upload(@Body() dto: CreateEnvironmentalRecordDto) {
    return this.environmentalDataService.ingestData(dto);
  }
@Get('dashboard')
async getDashboard() {
  return this.environmentalDataService.getCampusDashboard();
}
@Get('alerts')
async getAlerts() {
  return this.environmentalDataService.getLatestAlerts();
}
}