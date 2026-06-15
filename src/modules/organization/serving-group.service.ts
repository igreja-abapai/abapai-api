import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../member/entities/member.entity';
import {
    CreateServingGroupDto,
    CreateServingGroupMemberDto,
    UpdateServingGroupDto,
    UpdateServingGroupMemberDto,
} from './dto/serving-group.dto';
import { ServiceRole } from './entities/service-role.entity';
import { ServingGroupMember } from './entities/serving-group-member.entity';
import { ServingGroup } from './entities/serving-group.entity';

@Injectable()
export class ServingGroupService {
    constructor(
        @InjectRepository(ServingGroup)
        private readonly servingGroupRepository: Repository<ServingGroup>,
        @InjectRepository(ServingGroupMember)
        private readonly servingGroupMemberRepository: Repository<ServingGroupMember>,
        @InjectRepository(Member)
        private readonly memberRepository: Repository<Member>,
        @InjectRepository(ServiceRole)
        private readonly serviceRoleRepository: Repository<ServiceRole>,
    ) {}

    async createServingGroup(dto: CreateServingGroupDto, userId: number): Promise<ServingGroup> {
        await this.ensureServiceRoleExists(dto.serviceRoleId);

        const uniqueMemberIds = [...new Set(dto.memberIds)];
        for (const memberId of uniqueMemberIds) {
            await this.ensureMemberExists(memberId);
        }

        const servingGroup = this.servingGroupRepository.create({
            name: dto.name,
            serviceRoleId: dto.serviceRoleId,
            notes: dto.notes,
            isActive: dto.isActive,
            createdBy: userId,
            updatedBy: userId,
        });
        const saved = await this.servingGroupRepository.save(servingGroup);

        for (const memberId of uniqueMemberIds) {
            await this.servingGroupMemberRepository.save(
                this.servingGroupMemberRepository.create({
                    servingGroupId: saved.id,
                    memberId,
                    createdBy: userId,
                    updatedBy: userId,
                }),
            );
        }

        return await this.findServingGroupById(saved.id);
    }

    async findAllServingGroups(): Promise<ServingGroup[]> {
        return await this.servingGroupRepository.find({
            relations: ['members', 'members.member', 'serviceRole'],
            order: { name: 'ASC' },
        });
    }

    async findServingGroupById(id: number): Promise<ServingGroup> {
        const servingGroup = await this.servingGroupRepository.findOne({
            where: { id },
            relations: ['members', 'members.member', 'serviceRole'],
        });
        if (!servingGroup) {
            throw new NotFoundException('Grupo de serviço não encontrado');
        }
        return servingGroup;
    }

    async updateServingGroup(
        id: number,
        dto: UpdateServingGroupDto,
        userId: number,
    ): Promise<ServingGroup> {
        await this.findServingGroupById(id);

        if (dto.serviceRoleId) {
            await this.ensureServiceRoleExists(dto.serviceRoleId);
        }

        const { memberIds, ...groupData } = dto;

        if (Object.keys(groupData).length > 0) {
            await this.servingGroupRepository.update(id, {
                ...groupData,
                updatedBy: userId,
            });
        }

        if (memberIds !== undefined) {
            const uniqueMemberIds = [...new Set(memberIds)];
            for (const memberId of uniqueMemberIds) {
                await this.ensureMemberExists(memberId);
            }

            const existingLinks = await this.servingGroupMemberRepository.find({
                where: { servingGroupId: id },
            });
            const existingMemberIds = new Set(existingLinks.map((link) => link.memberId));
            const targetMemberIds = new Set(uniqueMemberIds);

            for (const link of existingLinks) {
                if (!targetMemberIds.has(link.memberId)) {
                    await this.servingGroupMemberRepository.delete(link.id);
                }
            }

            for (const memberId of uniqueMemberIds) {
                if (!existingMemberIds.has(memberId)) {
                    await this.servingGroupMemberRepository.save(
                        this.servingGroupMemberRepository.create({
                            servingGroupId: id,
                            memberId,
                            createdBy: userId,
                            updatedBy: userId,
                        }),
                    );
                }
            }
        }

        return await this.findServingGroupById(id);
    }

    async removeServingGroup(id: number, userId: number): Promise<void> {
        await this.findServingGroupById(id);
        await this.servingGroupRepository.update(id, { updatedBy: userId });
        await this.servingGroupRepository.delete(id);
    }

    async createServingGroupMember(
        dto: CreateServingGroupMemberDto,
        userId: number,
    ): Promise<ServingGroupMember> {
        await this.findServingGroupById(dto.servingGroupId);
        await this.ensureMemberExists(dto.memberId);

        const existing = await this.servingGroupMemberRepository.findOne({
            where: {
                servingGroupId: dto.servingGroupId,
                memberId: dto.memberId,
            },
        });

        if (existing) {
            throw new ConflictException('Membro já vinculado a este grupo');
        }

        const servingGroupMember = this.servingGroupMemberRepository.create({
            ...dto,
            createdBy: userId,
            updatedBy: userId,
        });
        const saved = await this.servingGroupMemberRepository.save(servingGroupMember);
        return await this.findServingGroupMemberById(saved.id);
    }

    async findAllServingGroupMembers(): Promise<ServingGroupMember[]> {
        return await this.servingGroupMemberRepository.find({
            relations: ['servingGroup', 'member'],
            order: { id: 'DESC' },
        });
    }

    async findServingGroupMemberById(id: number): Promise<ServingGroupMember> {
        const servingGroupMember = await this.servingGroupMemberRepository.findOne({
            where: { id },
            relations: ['servingGroup', 'member'],
        });
        if (!servingGroupMember) {
            throw new NotFoundException('Vínculo grupo/membro não encontrado');
        }
        return servingGroupMember;
    }

    async updateServingGroupMember(
        id: number,
        dto: UpdateServingGroupMemberDto,
        userId: number,
    ): Promise<ServingGroupMember> {
        const existing = await this.findServingGroupMemberById(id);

        if (dto.servingGroupId && dto.servingGroupId !== existing.servingGroupId) {
            await this.findServingGroupById(dto.servingGroupId);
        }

        if (dto.memberId && dto.memberId !== existing.memberId) {
            await this.ensureMemberExists(dto.memberId);
        }

        await this.servingGroupMemberRepository.update(id, {
            ...dto,
            updatedBy: userId,
        });
        return await this.findServingGroupMemberById(id);
    }

    async removeServingGroupMember(id: number, userId: number): Promise<void> {
        await this.findServingGroupMemberById(id);
        await this.servingGroupMemberRepository.update(id, { updatedBy: userId });
        await this.servingGroupMemberRepository.delete(id);
    }

    private async ensureMemberExists(id: number): Promise<void> {
        const member = await this.memberRepository.findOne({ where: { id } });
        if (!member) {
            throw new NotFoundException('Membro não encontrado');
        }
    }

    private async ensureServiceRoleExists(id: number): Promise<void> {
        const role = await this.serviceRoleRepository.findOne({ where: { id } });
        if (!role) {
            throw new NotFoundException('Função de serviço não encontrada');
        }
    }
}
