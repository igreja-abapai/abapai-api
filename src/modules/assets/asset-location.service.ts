import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssetLocationDto, UpdateAssetLocationDto } from './dto/asset-location.dto';
import { AssetLocation } from './entities/asset-location.entity';
import { Asset } from './entities/asset.entity';

@Injectable()
export class AssetLocationService {
    constructor(
        @InjectRepository(AssetLocation)
        private readonly locationRepository: Repository<AssetLocation>,
        @InjectRepository(Asset)
        private readonly assetRepository: Repository<Asset>,
    ) {}

    async create(dto: CreateAssetLocationDto, userId: number): Promise<AssetLocation> {
        const location = this.locationRepository.create({
            ...dto,
            createdBy: userId,
            updatedBy: userId,
        });
        return await this.locationRepository.save(location);
    }

    async findAll(): Promise<AssetLocation[]> {
        return await this.locationRepository.find({
            order: { name: 'ASC' },
        });
    }

    async findById(id: number): Promise<AssetLocation> {
        const location = await this.locationRepository.findOne({ where: { id } });
        if (!location) {
            throw new NotFoundException('Local não encontrado');
        }
        return location;
    }

    async update(id: number, dto: UpdateAssetLocationDto, userId: number): Promise<AssetLocation> {
        await this.findById(id);
        await this.locationRepository.update(id, {
            ...dto,
            updatedBy: userId,
        });
        return await this.findById(id);
    }

    async remove(id: number, userId: number): Promise<void> {
        await this.findById(id);
        const inUse = await this.assetRepository.count({ where: { locationId: id } });
        if (inUse > 0) {
            throw new BadRequestException(
                'Não é possível excluir local vinculado a bens patrimoniais',
            );
        }
        await this.locationRepository.update(id, { updatedBy: userId });
        await this.locationRepository.delete(id);
    }
}
