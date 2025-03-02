import { Module } from '@nestjs/common';
import { PrayerRequestService } from './prayer-request.service';
import { PrayerRequestController } from './prayer-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrayerRequest } from './entities/prayer-request.entity';
import { PrayerRequestRepository } from './prayer-request.repository';

@Module({
imports: [TypeOrmModule.forFeature([PrayerRequest])],
  controllers: [PrayerRequestController],
  providers: [PrayerRequestService, PrayerRequestRepository],
})
export class PrayerRequestModule {}
