// src/environmental-data/environmental-data.module.ts
import { Module } from '@nestjs/common';
import { EnvironmentalDataController } from './environmental-data.controller';
import { EnvironmentalDataService } from './environmental-data.service';
import { PrismaModule } from 'prisma/prisma.module';


@Module({
  imports: [PrismaModule], 
  controllers: [EnvironmentalDataController],
  providers: [EnvironmentalDataService],
})
export class EnvironmentalDataModule {}