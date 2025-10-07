import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CarouselImageService } from './carousel-image.service';
import { CreateCarouselImageDto } from './dto/create-carousel-image.dto';
import { UpdateCarouselImageDto } from './dto/update-carousel-image.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('carousel-images')
export class CarouselImageController {
    constructor(private readonly service: CarouselImageService) {}

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get('admin')
    @UseGuards(AuthGuard('jwt'))
    findAllForAdmin() {
        return this.service.findAllForAdmin();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(Number(id));
    }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() dto: CreateCarouselImageDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    update(@Param('id') id: string, @Body() dto: UpdateCarouselImageDto) {
        return this.service.update(Number(id), dto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    remove(@Param('id') id: string) {
        return this.service.remove(Number(id));
    }
}
