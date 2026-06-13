import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { EnvironmentalDataModule } from './environmental-data/environmental-data.module';
import { ScenariosModule } from './scenarios/scenarios.module';
import { UsersModule } from './users/users.module';
import { ActivityLogModule } from './activity-log/activity-log.module';



@Module({
  imports: [AuthModule, PrismaModule,EnvironmentalDataModule, ScenariosModule,UsersModule,ActivityLogModule,],
  controllers: [AppController],
  providers: [AppService],
 
})
export class AppModule {}
