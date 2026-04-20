import { Module } from '@nestjs/common';
import { EnvironmentalDataController } from './environmental-data.controller';
import { EnvironmentalDataService } from './environmental-data.service';
import { PrismaModule } from 'prisma/prisma.module';
import { EnvironmentalDataGateway } from './environmental-data.gateway';


@Module({
  imports: [PrismaModule], 
  controllers: [EnvironmentalDataController],
  providers: [EnvironmentalDataService,EnvironmentalDataGateway],
})
export class EnvironmentalDataModule {}