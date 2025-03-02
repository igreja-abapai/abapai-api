import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreatePrayerRequestDto } from './dto/create-prayer-request.dto';
import { PrayerRequestService } from './prayer-request.service';

@Controller('prayer-request')
export class PrayerRequestController {
    constructor(private readonly prayerRequestService: PrayerRequestService) {}

    @Post()
    create(@Body() createPrayerRequestDto: CreatePrayerRequestDto) {
        return this.prayerRequestService.create(createPrayerRequestDto);
    }

    @Get()
    findAll() {
        return this.prayerRequestService.findAll();
    }

    // @Get(':id')
    // findOne(@Param('id') id: string) {
    //     return this.prayerRequestService.findOne(+id);
    // }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.prayerRequestService.remove(+id);
    }
}
