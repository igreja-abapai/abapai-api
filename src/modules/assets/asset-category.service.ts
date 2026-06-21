import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssetCategoryDto, UpdateAssetCategoryDto } from './dto/asset-category.dto';
import { AssetCategory } from './entities/asset-category.entity';
import { Asset } from './entities/asset.entity';

@Injectable()
export class AssetCategoryService {
    constructor(
        @InjectRepository(AssetCategory)
        private readonly categoryRepository: Repository<AssetCategory>,
        @InjectRepository(Asset)
        private readonly assetRepository: Repository<Asset>,
    ) {}

    async create(dto: CreateAssetCategoryDto, userId: number): Promise<AssetCategory> {
        const category = this.categoryRepository.create({
            ...dto,
            createdBy: userId,
            updatedBy: userId,
        });
        return await this.categoryRepository.save(category);
    }

    async findAll(): Promise<AssetCategory[]> {
        return await this.categoryRepository.find({
            order: { name: 'ASC' },
        });
    }

    async findById(id: number): Promise<AssetCategory> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException('Categoria não encontrada');
        }
        return category;
    }

    async update(id: number, dto: UpdateAssetCategoryDto, userId: number): Promise<AssetCategory> {
        await this.findById(id);
        await this.categoryRepository.update(id, {
            ...dto,
            updatedBy: userId,
        });
        return await this.findById(id);
    }

    async remove(id: number, userId: number): Promise<void> {
        await this.findById(id);
        const inUse = await this.assetRepository.count({ where: { categoryId: id } });
        if (inUse > 0) {
            throw new BadRequestException(
                'Não é possível excluir categoria vinculada a bens patrimoniais',
            );
        }
        await this.categoryRepository.update(id, { updatedBy: userId });
        await this.categoryRepository.delete(id);
    }
}
