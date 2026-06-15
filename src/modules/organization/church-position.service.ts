import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    CreateChurchPositionDto,
    CreateDepartmentPositionEligibilityDto,
    UpdateChurchPositionDto,
    UpdateDepartmentPositionEligibilityDto,
} from './dto/church-position.dto';
import { ChurchPosition } from './entities/church-position.entity';
import { DepartmentPositionEligibility } from './entities/department-position-eligibility.entity';
import { Department } from './entities/department.entity';

@Injectable()
export class ChurchPositionService {
    constructor(
        @InjectRepository(ChurchPosition)
        private readonly churchPositionRepository: Repository<ChurchPosition>,
        @InjectRepository(DepartmentPositionEligibility)
        private readonly departmentPositionEligibilityRepository: Repository<DepartmentPositionEligibility>,
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
    ) {}

    async createChurchPosition(
        dto: CreateChurchPositionDto,
        userId: number,
    ): Promise<ChurchPosition> {
        const position = this.churchPositionRepository.create({
            ...dto,
            createdBy: userId,
            updatedBy: userId,
        });
        return await this.churchPositionRepository.save(position);
    }

    async findAllChurchPositions(): Promise<ChurchPosition[]> {
        return await this.churchPositionRepository.find({
            order: { sortOrder: 'ASC', name: 'ASC' },
        });
    }

    async findChurchPositionById(id: number): Promise<ChurchPosition> {
        const position = await this.churchPositionRepository.findOne({
            where: { id },
            relations: ['departmentEligibilities'],
        });

        if (!position) {
            throw new NotFoundException('Cargo não encontrado');
        }

        return position;
    }

    async updateChurchPosition(
        id: number,
        dto: UpdateChurchPositionDto,
        userId: number,
    ): Promise<ChurchPosition> {
        await this.findChurchPositionById(id);
        await this.churchPositionRepository.update(id, {
            ...dto,
            updatedBy: userId,
        });
        return await this.findChurchPositionById(id);
    }

    async removeChurchPosition(id: number, userId: number): Promise<void> {
        await this.ensureChurchPositionExists(id);
        await this.churchPositionRepository.update(id, { updatedBy: userId });
        await this.churchPositionRepository.delete(id);
    }

    async createDepartmentPositionEligibility(
        dto: CreateDepartmentPositionEligibilityDto,
        userId: number,
    ): Promise<DepartmentPositionEligibility> {
        await this.ensureDepartmentExists(dto.departmentId);
        await this.ensureChurchPositionExists(dto.churchPositionId);

        const existing = await this.departmentPositionEligibilityRepository.findOne({
            where: {
                departmentId: dto.departmentId,
                churchPositionId: dto.churchPositionId,
            },
        });

        if (existing) {
            throw new ConflictException(
                'Elegibilidade de departamento já cadastrada para este cargo',
            );
        }

        const eligibility = this.departmentPositionEligibilityRepository.create({
            ...dto,
            createdBy: userId,
            updatedBy: userId,
        });
        const saved = await this.departmentPositionEligibilityRepository.save(eligibility);
        return await this.findDepartmentPositionEligibilityById(saved.id);
    }

    async findAllDepartmentPositionEligibilities(): Promise<DepartmentPositionEligibility[]> {
        return await this.departmentPositionEligibilityRepository.find({
            relations: ['department', 'churchPosition'],
            order: { id: 'DESC' },
        });
    }

    async findDepartmentPositionEligibilityById(
        id: number,
    ): Promise<DepartmentPositionEligibility> {
        const eligibility = await this.departmentPositionEligibilityRepository.findOne({
            where: { id },
            relations: ['department', 'churchPosition'],
        });

        if (!eligibility) {
            throw new NotFoundException('Elegibilidade departamento/cargo não encontrada');
        }

        return eligibility;
    }

    async updateDepartmentPositionEligibility(
        id: number,
        dto: UpdateDepartmentPositionEligibilityDto,
        userId: number,
    ): Promise<DepartmentPositionEligibility> {
        const existing = await this.findDepartmentPositionEligibilityById(id);

        if (dto.churchPositionId && dto.churchPositionId !== existing.churchPositionId) {
            await this.ensureChurchPositionExists(dto.churchPositionId);
        }
        if (dto.departmentId && dto.departmentId !== existing.departmentId) {
            await this.ensureDepartmentExists(dto.departmentId);
        }

        const nextDepartmentId = dto.departmentId ?? existing.departmentId;
        const nextPositionId = dto.churchPositionId ?? existing.churchPositionId;

        if (
            nextDepartmentId !== existing.departmentId ||
            nextPositionId !== existing.churchPositionId
        ) {
            const duplicate = await this.departmentPositionEligibilityRepository.findOne({
                where: {
                    departmentId: nextDepartmentId,
                    churchPositionId: nextPositionId,
                },
            });
            if (duplicate && duplicate.id !== id) {
                throw new ConflictException(
                    'Elegibilidade de departamento já cadastrada para este cargo',
                );
            }
        }

        await this.departmentPositionEligibilityRepository.update(id, {
            ...dto,
            updatedBy: userId,
        });
        return await this.findDepartmentPositionEligibilityById(id);
    }

    async removeDepartmentPositionEligibility(id: number, userId: number): Promise<void> {
        await this.findDepartmentPositionEligibilityById(id);
        await this.departmentPositionEligibilityRepository.update(id, { updatedBy: userId });
        await this.departmentPositionEligibilityRepository.delete(id);
    }

    validateDistinctPositions(
        primaryPositionId?: number | null,
        secondaryPositionId?: number | null,
    ): void {
        if (primaryPositionId && secondaryPositionId && primaryPositionId === secondaryPositionId) {
            throw new BadRequestException(
                'Cargo principal e cargo secundário devem ser diferentes',
            );
        }
    }

    private async ensureChurchPositionExists(id: number): Promise<void> {
        const position = await this.churchPositionRepository.findOne({ where: { id } });
        if (!position) {
            throw new NotFoundException('Cargo não encontrado');
        }
    }

    private async ensureDepartmentExists(id: number): Promise<void> {
        const department = await this.departmentRepository.findOne({ where: { id } });
        if (!department) {
            throw new NotFoundException('Departamento não encontrado');
        }
    }
}
