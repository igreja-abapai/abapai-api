import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleEvent } from './entities/schedule-event.entity';
import { ScheduleEventService } from './schedule-event.service';
import { ScheduleEventController } from './schedule-event.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ScheduleEvent])],
    providers: [ScheduleEventService],
    controllers: [ScheduleEventController],
    exports: [ScheduleEventService],
})
export class ScheduleEventModule {}
