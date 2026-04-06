import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateEnvironmentalRecordDto } from './dto/create-environmental-record.dto';
import { EnvironmentalDataGateway } from './environmental-data.gateway';

@Injectable()
export class EnvironmentalDataService {
  private readonly logger = new Logger(EnvironmentalDataService.name);

  constructor(private prisma: PrismaService,
    private readonly gateway: EnvironmentalDataGateway
  ) {}

async ingestData(dto: CreateEnvironmentalRecordDto) {
  this.gateway.broadcastAlert({ test: "Bingo" });
    const { elementId, ...measurements } = dto;

   
    const units: Record<string, string> = {
      temperature: '°C',
      humidity: '%',
      traffic: 'count',
      co2: 'ppm',
    };


    const dataToInsert = Object.entries(measurements)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => ({
        elementId: elementId,
        dataType: key === 'co2' ? 'AIR_QUALITY' : key.toUpperCase(),
        value: Number(value),
        unit: units[key] || '',
      }));

    if (dataToInsert.length === 0) {
      return { message: 'No valid data provided' };
    }
    await this.runEngineeringAnalytics(dto);
    try {
  
      const result = await this.prisma.environmentalData.createMany({
        data: dataToInsert,
      });




      this.logger.log(`Inserted ${result.count} records for element ${elementId}`);
      return { count: result.count, status: 'Created' };
    } catch (error: any) { // MODIFICARE: Adaugă ": any" aici
      this.logger.error(`Error: ${error.message}`); // Acum nu mai dă eroare la .message
      throw new InternalServerErrorException('Database failed');
    }
  }

private async runEngineeringAnalytics(dto: CreateEnvironmentalRecordDto) {

  const { elementId, temperature, humidity, co2 } = dto;

  // 1. ANALIZA DELTA (Doar dacă avem temperatură în pachet)
  if (temperature !== undefined && temperature !== null) {
    const lastReading = await this.prisma.environmentalData.findFirst({
      where: { elementId, dataType: 'TEMPERATURE' },
      orderBy: { measuredAt: 'desc' },
      skip: 1 
    });

    if (lastReading) {
      const diff = temperature - lastReading.value;
      if (Math.abs(diff) >= 3) {
       await this.sendSmartAlert(elementId, 'ANOMALY', 'CRITICAL', 
          `Rapid temperature change: ${diff > 0 ? '+' : ''}${diff.toFixed(1)}°C detected.`);
      }
    }
  }

  // 2. DETECȚIA OUTLIERS (Doar dacă avem temperatură)
  if (temperature !== undefined && temperature !== null) {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const avg = await this.prisma.environmentalData.aggregate({
      where: { elementId, dataType: 'TEMPERATURE', measuredAt: { gte: hourAgo } },
      _avg: { value: true }
    });

    if (avg._avg.value && Math.abs(temperature - avg._avg.value) > 5) {
      await this.sendSmartAlert(elementId, 'OUTLIER', 'WARNING', 
    `Outlier: Reading of ${temperature}°C deviates significantly from building average (${avg._avg.value.toFixed(1)}°C).`);
    }
  }

  // 3. RISC IGRASIE (Avem nevoie și de temperatură ȘI de umiditate)
  if (humidity !== undefined && temperature !== undefined) {
    if (humidity > 75 && temperature < 18) {
      await this.sendSmartAlert(elementId, 'MOLD_RISK', 'CRITICAL', 
    "High risk of condensation and mold growth detected!");
    }
  }

  
if (co2 !== undefined && co2 !== null) {
    if (co2 > 1200) {
      await this.sendSmartAlert(elementId, 'AIR_QUALITY', 'WARNING', 
       "Critical CO2 levels! Occupancy flow management required.");
    }
  }
}


private async sendSmartAlert(elementId: number, action: string, severity: string, message: string) {
  const alert = await this.prisma.activityLog.create({
    data: { elementId, action, severity, message }
  });
  this.gateway.broadcastAlert(alert);
}
 async getCampusDashboard() {

  const latestData = await this.prisma.environmentalData.findMany({
    distinct: ['elementId', 'dataType'],
    orderBy: { measuredAt: 'desc' },
  });


  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);

  const history = await this.prisma.environmentalData.findMany({
    where: { measuredAt: { gte: yesterday } },
    orderBy: { measuredAt: 'asc' },
    select: { value: true, dataType: true, measuredAt: true }
  });


  const summary = {
    temp: 0,
    traffic: 0,
    co2: 0,
    hum: 0
  };

  latestData.forEach(d => {
    if (d.dataType === 'TEMPERATURE') summary.temp += d.value;
    if (d.dataType === 'TRAFFIC') summary.traffic += d.value;
    if (d.dataType === 'AIR_QUALITY') summary.co2 += d.value;
    if (d.dataType === 'HUMIDITY') summary.hum += d.value;
  });

  const count = 3; 

  return {
    current: {
      temperature: (summary.temp / count).toFixed(1),
      traffic: summary.traffic,
      co2: (summary.co2 / count).toFixed(0),
      humidity: (summary.hum / count).toFixed(0)
    },
    chartData: history 
  };
}
  async getLatestAlerts() {
  return await this.prisma.activityLog.findMany({
    where: { severity: 'CRITICAL' }, 
    orderBy: { createdAt: 'desc' },
    take: 5, 
    include: {
      element: { select: { name: true } } 
    }
  });
}

}