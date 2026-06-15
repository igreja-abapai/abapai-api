import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../member/entities/member.entity';
import {
    CreateDepartmentDto,
    CreateMemberDepartmentDto,
    UpdateDepartmentDto,
    UpdateMemberDepartmentDto,
} from './dto/department.dto';
import { Department } from './entities/department.entity';
import { MemberDepartment } from './entities/member-department.entity';
import { EligibilityService } from './eligibility.service';

@Injectable()
export class DepartmentService {
    constructor(
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
        @InjectRepository(MemberDepartment)
        private readonly memberDepartmentRepository: Repository<MemberDepartment>,
        @InjectRepository(Member)
        private readonly memberRepository: Repository<Member>,
        private readonly eligibilityService: EligibilityService,
    ) {}

    async createDepartment(dto: CreateDepartmentDto, userId: number): Promise<Department> {
        if (dto.parentId) {
            await this.ensureDepartmentExists(dto.parentId);
        }

        const department = this.departmentRepository.create({
            ...dto,
            createdBy: userId,
            updatedBy: userId,
        });

        return await this.departmentRepository.save(department);
    }

    async findAllDepartments(): Promise<Department[]> {
        return await this.departmentRepository.find({
            relations: ['parent', 'children', 'memberDepartments'],
            order: { name: 'ASC' },
        });
    }

    async findDepartmentById(id: number): Promise<Department> {
        const department = await this.departmentRepository.findOne({
            where: { id },
            relations: [
                'parent',
                'children',
                'roleEligibilities',
                'roleEligibilities.serviceRole',
                'memberDepartments',
                'memberDepartments.member',
            ],
        });

        if (!department) {
            throw new NotFoundException('Departamento não encontrado');
        }

        return department;
    }

    async updateDepartment(
        id: number,
        dto: UpdateDepartmentDto,
        userId: number,
    ): Promise<Department> {
        await this.ensureDepartmentExists(id);

        if (dto.parentId) {
            if (dto.parentId === id) {
                throw new ConflictException('Departamento não pode ser pai de si mesmo');
            }
            await this.ensureDepartmentExists(dto.parentId);
        }

        await this.departmentRepository.update(id, {
            ...dto,
            updatedBy: userId,
        });

        return await this.findDepartmentById(id);
    }

    async removeDepartment(id: number, userId: number): Promise<void> {
        await this.ensureDepartmentExists(id);
        await this.departmentRepository.update(id, { updatedBy: userId });
        await this.departmentRepository.delete(id);
    }

    async createMemberDepartment(
        dto: CreateMemberDepartmentDto,
        userId: number,
    ): Promise<MemberDepartment> {
        await this.ensureDepartmentExists(dto.departmentId);
        await this.ensureMemberExists(dto.memberId);

        const existing = await this.memberDepartmentRepository.findOne({
            where: {
                memberId: dto.memberId,
                departmentId: dto.departmentId,
            },
        });

        if (existing) {
            throw new ConflictException('Membro já vinculado a este departamento');
        }

        const memberDepartment = this.memberDepartmentRepository.create({
            ...dto,
            startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
            endedAt: dto.endedAt ? new Date(dto.endedAt) : undefined,
            createdBy: userId,
            updatedBy: userId,
        });

        const saved = await this.memberDepartmentRepository.save(memberDepartment);
        await this.eligibilityService.syncMemberCapabilitiesFromDepartments(saved.memberId);
        return await this.findMemberDepartmentById(saved.id);
    }

    async findAllMemberDepartments(): Promise<MemberDepartment[]> {
        return await this.memberDepartmentRepository.find({
            relations: ['member', 'department'],
            order: { id: 'DESC' },
        });
    }

    async findMemberDepartmentById(id: number): Promise<MemberDepartment> {
        const memberDepartment = await this.memberDepartmentRepository.findOne({
            where: { id },
            relations: ['member', 'department'],
        });

        if (!memberDepartment) {
            throw new NotFoundException('Vínculo membro/departamento não encontrado');
        }

        return memberDepartment;
    }

    async updateMemberDepartment(
        id: number,
        dto: UpdateMemberDepartmentDto,
        userId: number,
    ): Promise<MemberDepartment> {
        const existing = await this.findMemberDepartmentById(id);

        if (dto.departmentId && dto.departmentId !== existing.departmentId) {
            await this.ensureDepartmentExists(dto.departmentId);
        }

        if (dto.memberId && dto.memberId !== existing.memberId) {
            await this.ensureMemberExists(dto.memberId);
        }

        await this.memberDepartmentRepository.update(id, {
            ...dto,
            startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
            endedAt: dto.endedAt ? new Date(dto.endedAt) : undefined,
            updatedBy: userId,
        });

        const updated = await this.findMemberDepartmentById(id);

        await this.eligibilityService.syncMemberCapabilitiesFromDepartments(existing.memberId);
        if (updated.memberId !== existing.memberId) {
            await this.eligibilityService.syncMemberCapabilitiesFromDepartments(updated.memberId);
        }

        return updated;
    }

    async removeMemberDepartment(id: number, userId: number): Promise<void> {
        const existing = await this.findMemberDepartmentById(id);
        await this.memberDepartmentRepository.update(id, { updatedBy: userId });
        await this.memberDepartmentRepository.delete(id);
        await this.eligibilityService.syncMemberCapabilitiesFromDepartments(existing.memberId);
    }

    private async ensureDepartmentExists(id: number): Promise<void> {
        const department = await this.departmentRepository.findOne({ where: { id } });
        if (!department) {
            throw new NotFoundException('Departamento não encontrado');
        }
    }

    private async ensureMemberExists(id: number): Promise<void> {
        const member = await this.memberRepository.findOne({ where: { id } });
        if (!member) {
            throw new NotFoundException('Membro não encontrado');
        }
    }
}
