import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarouselImage } from './entities/carousel-image.entity';
import { CarouselImageService } from './carousel-image.service';
import { CarouselImageController } from './carousel-image.controller';

@Module({
    imports: [TypeOrmModule.forFeature([CarouselImage])],
    providers: [CarouselImageService],
    controllers: [CarouselImageController],
    exports: [CarouselImageService],
})
export class CarouselImageModule {}
