import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleEvent } from './entities/schedule-event.entity';
import { CreateScheduleEventDto } from './dto/create-schedule-event.dto';
import { UpdateScheduleEventDto } from './dto/update-schedule-event.dto';

@Injectable()
export class ScheduleEventService {
    constructor(
        @InjectRepository(ScheduleEvent)
        private readonly repo: Repository<ScheduleEvent>,
    ) {}

    findAll(): Promise<ScheduleEvent[]> {
        return this.repo.find({ order: { position: 'ASC', createdAt: 'ASC' } });
    }

    findOne(id: number): Promise<ScheduleEvent | null> {
        return this.repo.findOne({ where: { id } });
    }

    async create(dto: CreateScheduleEventDto): Promise<ScheduleEvent> {
        const entity = this.repo.create({ ...dto });
        return this.repo.save(entity);
    }

    async update(id: number, dto: UpdateScheduleEventDto): Promise<ScheduleEvent> {
        await this.repo.update({ id }, dto);
        const updated = await this.findOne(id);
        return updated as ScheduleEvent;
    }

    async remove(id: number): Promise<void> {
        await this.repo.delete({ id });
    }
}
