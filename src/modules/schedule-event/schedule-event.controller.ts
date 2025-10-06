import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ScheduleEventService } from './schedule-event.service';
import { CreateScheduleEventDto } from './dto/create-schedule-event.dto';
import { UpdateScheduleEventDto } from './dto/update-schedule-event.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('schedule-events')
export class ScheduleEventController {
    constructor(private readonly service: ScheduleEventService) {}

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(Number(id));
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() dto: CreateScheduleEventDto) {
        return this.service.create(dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateScheduleEventDto) {
        return this.service.update(Number(id), dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(Number(id));
    }
}
