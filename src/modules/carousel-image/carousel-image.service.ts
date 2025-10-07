import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarouselImage } from './entities/carousel-image.entity';
import { CreateCarouselImageDto } from './dto/create-carousel-image.dto';
import { UpdateCarouselImageDto } from './dto/update-carousel-image.dto';

@Injectable()
export class CarouselImageService {
    constructor(
        @InjectRepository(CarouselImage)
        private readonly repo: Repository<CarouselImage>,
    ) {}

    findAll(): Promise<CarouselImage[]> {
        return this.repo.find({
            where: { isActive: true },
            order: { position: 'ASC', createdAt: 'ASC' },
        });
    }

    findAllForAdmin(): Promise<CarouselImage[]> {
        return this.repo.find({
            order: { position: 'ASC', createdAt: 'ASC' },
        });
    }

    findOne(id: number): Promise<CarouselImage | null> {
        return this.repo.findOne({ where: { id } });
    }

    async create(dto: CreateCarouselImageDto): Promise<CarouselImage> {
        const entity = this.repo.create({ ...dto });
        return this.repo.save(entity);
    }

    async update(id: number, dto: UpdateCarouselImageDto): Promise<CarouselImage> {
        await this.repo.update({ id }, dto);
        const updated = await this.findOne(id);
        return updated as CarouselImage;
    }

    async remove(id: number): Promise<void> {
        await this.repo.delete({ id });
    }
}
