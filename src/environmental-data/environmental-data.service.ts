// src/environmental-data/environmental-data.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateEnvironmentalRecordDto } from './create-environmental-record.dto';


@Injectable()
export class EnvironmentalDataService {
  private readonly logger = new Logger(EnvironmentalDataService.name);

  constructor(private prisma: PrismaService) {}

 async ingestData(dto: CreateEnvironmentalRecordDto) {
  const { elementId, temperature, humidity, traffic, co2 } = dto;

  try {
  
    return await this.prisma.$transaction(async (tx) => {
      
   
      const dataToInsert = [
        { dataType: 'TEMPERATURE', value: temperature, unit: '°C' },
        { dataType: 'HUMIDITY', value: humidity, unit: '%' },
        { dataType: 'TRAFFIC', value: traffic, unit: 'count' },
        { dataType: 'AIR_QUALITY', value: co2, unit: 'ppm' },
      ];

      const createdRecords = await Promise.all(
        dataToInsert.map((item) =>
          tx.environmentalData.create({
            data: {
              elementId: elementId,
              dataType: item.dataType,
              value: item.value,
              unit: item.unit,
            },
          }),
        ),
      );

      this.logger.log(`Succesfully ingested 4 records for element ${elementId}`);
      return { count: createdRecords.length, status: 'Created' };
    });
  } catch (error) {
    this.logger.error(`Error ingesting data: ${error.message}`);
    throw new InternalServerErrorException('Database synchronization failed');
  }
}
}