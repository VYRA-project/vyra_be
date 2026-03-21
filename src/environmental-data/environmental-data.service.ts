import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateEnvironmentalRecordDto } from './dto/create-environmental-record.dto';

@Injectable()
export class EnvironmentalDataService {
  private readonly logger = new Logger(EnvironmentalDataService.name);

  constructor(private prisma: PrismaService) {}

  async ingestData(dto: CreateEnvironmentalRecordDto) {
    const { elementId, ...measurements } = dto;

    // Definim unitățile de măsură pentru fiecare cheie
    const units: Record<string, string> = {
      temperature: '°C',
      humidity: '%',
      traffic: 'count',
      co2: 'ppm',
    };

    // Transformăm obiectul JSON într-o listă de înregistrări pentru baza de date
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

    try {
      // Inserăm toate citirile deodată în tabelul EnvironmentalData
      const result = await this.prisma.environmentalData.createMany({
        data: dataToInsert,
      });

      this.logger.log(`Inserted ${result.count} records for element ${elementId}`);
      return { count: result.count, status: 'Created' };
    } catch (error) {
      this.logger.error(`Error: ${error.message}`);
      throw new InternalServerErrorException('Database failed');
    }
  }
}