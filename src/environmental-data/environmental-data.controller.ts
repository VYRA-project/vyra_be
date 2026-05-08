// src/environmental-data/environmental-data.controller.ts
import { Controller, Post, Body, UsePipes, ValidationPipe, Get, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { EnvironmentalDataService } from './environmental-data.service';
import { CreateEnvironmentalRecordDto } from './dto/create-environmental-record.dto';
import { EnvironmentalDataGateway } from './environmental-data.gateway';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


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
  @UseGuards(JwtAuthGuard)
@Get('dashboard')
async getDashboard() {
  return this.environmentalDataService.getCampusDashboard();
}
@UseGuards(JwtAuthGuard)
@Get('alerts')
async getAlerts() {
  return this.environmentalDataService.getLatestAlerts();
}
@UseGuards(JwtAuthGuard)
@Get('reports/weekly-comparison')
async getWeeklyReport() {
  return await this.environmentalDataService.getWeeklyComparisonReport();
}
@UseGuards(JwtAuthGuard)
@Get('building/:id/analytics')
async getBuildingAnalytics(@Param('id', ParseIntPipe) id: number) {
  return await this.environmentalDataService.getBuildingAnalytics(id);
}
}