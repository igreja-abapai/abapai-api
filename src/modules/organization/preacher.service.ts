import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AwsService } from '../aws/aws.service';
import { CreatePreacherDto, UpdatePreacherDto } from './dto/preacher.dto';
import { Preacher } from './entities/preacher.entity';
import { ServiceAssignment } from './entities/service-assignment.entity';
import { isServiceAssignmentFilled } from './utils/service-assignment.utils';

export interface PreacherScheduleHistoryItem {
    assignmentId: number;
    worshipServiceId: number;
    serviceName: string;
    serviceRoleName: string;
    scheduledAt: string;
    status: string;
}

@Injectable()
export class PreacherService {
    constructor(
        @InjectRepository(Preacher)
        private readonly preacherRepository: Repository<Preacher>,
        @InjectRepository(ServiceAssignment)
        private readonly serviceAssignmentRepository: Repository<ServiceAssignment>,
        private readonly awsService: AwsService,
    ) {}

    async create(dto: CreatePreacherDto, userId: number): Promise<Preacher> {
        const preacher = this.preacherRepository.create({
            ...dto,
            createdBy: userId,
            updatedBy: userId,
        });
        const saved = await this.preacherRepository.save(preacher);
        return await this.findById(saved.id);
    }

    async findAll(): Promise<Preacher[]> {
        return await this.preacherRepository.find({
            order: { name: 'ASC' },
        });
    }

    async findById(id: number): Promise<Preacher> {
        const preacher = await this.preacherRepository.findOne({ where: { id } });
        if (!preacher) {
            throw new NotFoundException('Pregador não encontrado');
        }
        return preacher;
    }

    async getScheduleHistory(id: number): Promise<PreacherScheduleHistoryItem[]> {
        await this.findById(id);

        const assignments = await this.serviceAssignmentRepository.find({
            where: { preacherId: id },
            relations: ['worshipService', 'worshipService.worshipServiceType', 'serviceRole'],
        });

        return assignments
            .filter((assignment) => isServiceAssignmentFilled(assignment))
            .map((assignment) => ({
                assignmentId: assignment.id,
                worshipServiceId: assignment.worshipServiceId,
                serviceName:
                    assignment.worshipService?.name ||
                    assignment.worshipService?.worshipServiceType?.name ||
                    'Culto',
                serviceRoleName: assignment.serviceRole?.name || 'Função',
                scheduledAt: assignment.worshipService?.scheduledAt?.toISOString() || '',
                status: assignment.status,
            }))
            .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    }

    async update(id: number, dto: UpdatePreacherDto, userId: number): Promise<Preacher> {
        const existing = await this.findById(id);

        if (dto.photoUrl !== undefined && dto.photoUrl !== existing.photoUrl && existing.photoUrl) {
            await this.awsService.deleteObjectByUrl(existing.photoUrl);
        }

        await this.preacherRepository.update(id, {
            ...dto,
            updatedBy: userId,
        });
        return await this.findById(id);
    }

    async remove(id: number, userId: number): Promise<void> {
        const preacher = await this.findById(id);

        const inUse = await this.serviceAssignmentRepository.count({
            where: { preacherId: id },
        });
        if (inUse > 0) {
            throw new BadRequestException(
                'Não é possível excluir pregador vinculado a escalas existentes',
            );
        }

        if (preacher.photoUrl) {
            await this.awsService.deleteObjectByUrl(preacher.photoUrl);
        }

        await this.preacherRepository.update(id, { updatedBy: userId });
        await this.preacherRepository.delete(id);
    }

    async ensurePreacherExists(id: number): Promise<Preacher> {
        const preacher = await this.preacherRepository.findOne({ where: { id, isActive: true } });
        if (!preacher) {
            throw new NotFoundException('Pregador não encontrado ou inativo');
        }
        return preacher;
    }
}
