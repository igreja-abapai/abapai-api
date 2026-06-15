import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Member } from '../member/entities/member.entity';
import {
    CreateDepartmentRoleEligibilityDto,
    CreateMemberServiceCapabilityDto,
    CreateServiceRoleDto,
    UpdateDepartmentRoleEligibilityDto,
    UpdateMemberServiceCapabilityDto,
    UpdateServiceRoleDto,
} from './dto/service-role.dto';
import { DepartmentRoleEligibility } from './entities/department-role-eligibility.entity';
import { Department } from './entities/department.entity';
import { MemberDepartment } from './entities/member-department.entity';
import { MemberServiceCapability } from './entities/member-service-capability.entity';
import { ServiceRole } from './entities/service-role.entity';
import { CapabilitySource } from './enums/capability-source.enum';
import { EligibilityService } from './eligibility.service';

@Injectable()
export class ServiceRoleService {
    constructor(
        @InjectRepository(ServiceRole)
        private readonly serviceRoleRepository: Repository<ServiceRole>,
        @InjectRepository(MemberServiceCapability)
        private readonly memberServiceCapabilityRepository: Repository<MemberServiceCapability>,
        @InjectRepository(DepartmentRoleEligibility)
        private readonly departmentRoleEligibilityRepository: Repository<DepartmentRoleEligibility>,
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
        @InjectRepository(MemberDepartment)
        private readonly memberDepartmentRepository: Repository<MemberDepartment>,
        @InjectRepository(Member)
        private readonly memberRepository: Repository<Member>,
        private readonly eligibilityService: EligibilityService,
    ) {}

    async createServiceRole(dto: CreateServiceRoleDto, userId: number): Promise<ServiceRole> {
        const serviceRole = this.serviceRoleRepository.create({
            ...dto,
            createdBy: userId,
            updatedBy: userId,
        });
        return await this.serviceRoleRepository.save(serviceRole);
    }

    async findAllServiceRoles(): Promise<ServiceRole[]> {
        return await this.serviceRoleRepository.find({
            order: { name: 'ASC' },
        });
    }

    async findServiceRoleById(id: number): Promise<ServiceRole> {
        const serviceRole = await this.serviceRoleRepository.findOne({
            where: { id },
            relations: ['memberCapabilities', 'departmentEligibilities'],
        });

        if (!serviceRole) {
            throw new NotFoundException('Função de serviço não encontrada');
        }

        return serviceRole;
    }

    async updateServiceRole(
        id: number,
        dto: UpdateServiceRoleDto,
        userId: number,
    ): Promise<ServiceRole> {
        const existing = await this.findServiceRoleById(id);
        await this.serviceRoleRepository.update(id, {
            ...dto,
            updatedBy: userId,
        });

        if (dto.isActive !== undefined && dto.isActive !== existing.isActive) {
            const eligibilities = await this.departmentRoleEligibilityRepository.find({
                where: { serviceRoleId: id },
            });
            const departmentIds = [...new Set(eligibilities.map((item) => item.departmentId))];
            for (const departmentId of departmentIds) {
                await this.syncDepartmentMembersCapabilities(departmentId);
            }
        }

        return await this.findServiceRoleById(id);
    }

    async removeServiceRole(id: number, userId: number): Promise<void> {
        await this.ensureServiceRoleExists(id);
        await this.serviceRoleRepository.update(id, { updatedBy: userId });
        await this.serviceRoleRepository.delete(id);
    }

    async createMemberCapability(
        dto: CreateMemberServiceCapabilityDto,
        userId: number,
    ): Promise<MemberServiceCapability> {
        await this.ensureServiceRoleExists(dto.serviceRoleId);
        await this.ensureMemberExists(dto.memberId);

        const existing = await this.memberServiceCapabilityRepository.findOne({
            where: {
                memberId: dto.memberId,
                serviceRoleId: dto.serviceRoleId,
            },
        });

        if (existing) {
            throw new ConflictException('Capacidade do membro já cadastrada para esta função');
        }

        const capability = this.memberServiceCapabilityRepository.create({
            ...dto,
            source: dto.source || CapabilitySource.MANUAL,
            validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
            validTo: dto.validTo ? new Date(dto.validTo) : undefined,
            createdBy: userId,
            updatedBy: userId,
        });
        const saved = await this.memberServiceCapabilityRepository.save(capability);
        return await this.findMemberCapabilityById(saved.id);
    }

    async findAllMemberCapabilities(): Promise<MemberServiceCapability[]> {
        return await this.memberServiceCapabilityRepository.find({
            relations: ['member', 'serviceRole'],
            order: { id: 'DESC' },
        });
    }

    async findMemberCapabilityById(id: number): Promise<MemberServiceCapability> {
        const capability = await this.memberServiceCapabilityRepository.findOne({
            where: { id },
            relations: ['member', 'serviceRole'],
        });
        if (!capability) {
            throw new NotFoundException('Capacidade de serviço do membro não encontrada');
        }
        return capability;
    }

    async updateMemberCapability(
        id: number,
        dto: UpdateMemberServiceCapabilityDto,
        userId: number,
    ): Promise<MemberServiceCapability> {
        const existing = await this.findMemberCapabilityById(id);

        if (dto.memberId && dto.memberId !== existing.memberId) {
            await this.ensureMemberExists(dto.memberId);
        }
        if (dto.serviceRoleId && dto.serviceRoleId !== existing.serviceRoleId) {
            await this.ensureServiceRoleExists(dto.serviceRoleId);
        }

        await this.memberServiceCapabilityRepository.update(id, {
            ...dto,
            validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
            validTo: dto.validTo ? new Date(dto.validTo) : undefined,
            updatedBy: userId,
        });
        return await this.findMemberCapabilityById(id);
    }

    async removeMemberCapability(id: number, userId: number): Promise<void> {
        await this.findMemberCapabilityById(id);
        await this.memberServiceCapabilityRepository.update(id, { updatedBy: userId });
        await this.memberServiceCapabilityRepository.delete(id);
    }

    async createDepartmentRoleEligibility(
        dto: CreateDepartmentRoleEligibilityDto,
        userId: number,
    ): Promise<DepartmentRoleEligibility> {
        await this.ensureDepartmentExists(dto.departmentId);
        await this.ensureServiceRoleExists(dto.serviceRoleId);

        const existing = await this.departmentRoleEligibilityRepository.findOne({
            where: {
                departmentId: dto.departmentId,
                serviceRoleId: dto.serviceRoleId,
            },
        });

        if (existing) {
            throw new ConflictException(
                'Elegibilidade de departamento já cadastrada para esta função',
            );
        }

        const eligibility = this.departmentRoleEligibilityRepository.create({
            ...dto,
            createdBy: userId,
            updatedBy: userId,
        });
        const saved = await this.departmentRoleEligibilityRepository.save(eligibility);
        await this.syncDepartmentMembersCapabilities(saved.departmentId);
        return await this.findDepartmentRoleEligibilityById(saved.id);
    }

    async findAllDepartmentRoleEligibilities(): Promise<DepartmentRoleEligibility[]> {
        return await this.departmentRoleEligibilityRepository.find({
            relations: ['department', 'serviceRole'],
            order: { id: 'DESC' },
        });
    }

    async findDepartmentRoleEligibilityById(id: number): Promise<DepartmentRoleEligibility> {
        const eligibility = await this.departmentRoleEligibilityRepository.findOne({
            where: { id },
            relations: ['department', 'serviceRole'],
        });

        if (!eligibility) {
            throw new NotFoundException('Elegibilidade departamento/função não encontrada');
        }

        return eligibility;
    }

    async updateDepartmentRoleEligibility(
        id: number,
        dto: UpdateDepartmentRoleEligibilityDto,
        userId: number,
    ): Promise<DepartmentRoleEligibility> {
        const existing = await this.findDepartmentRoleEligibilityById(id);

        if (dto.serviceRoleId && dto.serviceRoleId !== existing.serviceRoleId) {
            await this.ensureServiceRoleExists(dto.serviceRoleId);
        }
        if (dto.departmentId && dto.departmentId !== existing.departmentId) {
            await this.ensureDepartmentExists(dto.departmentId);
        }

        await this.departmentRoleEligibilityRepository.update(id, {
            ...dto,
            updatedBy: userId,
        });

        const updated = await this.findDepartmentRoleEligibilityById(id);
        await this.syncDepartmentMembersCapabilities(existing.departmentId);
        if (updated.departmentId !== existing.departmentId) {
            await this.syncDepartmentMembersCapabilities(updated.departmentId);
        }
        return updated;
    }

    async removeDepartmentRoleEligibility(id: number, userId: number): Promise<void> {
        const existing = await this.findDepartmentRoleEligibilityById(id);
        await this.departmentRoleEligibilityRepository.update(id, { updatedBy: userId });
        await this.departmentRoleEligibilityRepository.delete(id);
        await this.syncDepartmentMembersCapabilities(existing.departmentId);
    }

    async getEligibleMembers(serviceRoleId: number): Promise<Member[]> {
        await this.ensureServiceRoleExists(serviceRoleId);
        return await this.eligibilityService.getEligibleMembers(serviceRoleId);
    }

    private async syncDepartmentMembersCapabilities(departmentId: number): Promise<void> {
        const memberDepartments = await this.memberDepartmentRepository.find({
            where: {
                departmentId,
                isActive: true,
                endedAt: IsNull(),
            },
        });

        const memberIds = [
            ...new Set(memberDepartments.map((item) => item.memberId).filter(Boolean)),
        ];
        if (memberIds.length === 0) {
            return;
        }

        const existingMembers = await this.memberRepository.find({
            where: { id: In(memberIds) },
        });
        const activeMemberIds = new Set(
            existingMembers
                .filter((member) => member.isActive && !member.deletedAt)
                .map((member) => member.id),
        );

        for (const memberId of memberIds) {
            if (!activeMemberIds.has(memberId)) {
                continue;
            }
            await this.eligibilityService.syncMemberCapabilitiesFromDepartments(memberId);
        }
    }

    private async ensureServiceRoleExists(id: number): Promise<void> {
        const role = await this.serviceRoleRepository.findOne({ where: { id } });
        if (!role) {
            throw new NotFoundException('Função de serviço não encontrada');
        }
    }

    private async ensureMemberExists(id: number): Promise<void> {
        const member = await this.memberRepository.findOne({ where: { id } });
        if (!member) {
            throw new NotFoundException('Membro não encontrado');
        }
    }

    private async ensureDepartmentExists(id: number): Promise<void> {
        const department = await this.departmentRepository.findOne({ where: { id } });
        if (!department) {
            throw new NotFoundException('Departamento não encontrado');
        }
    }
}
