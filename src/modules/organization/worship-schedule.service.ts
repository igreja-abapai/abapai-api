import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { DateTime } from 'luxon';
import {
    AssignServiceAssignmentDto,
    CopyWorshipServiceAssignmentsDto,
    CreateWorshipServiceDto,
    CreateWorshipServiceFromTemplateDto,
    CreateWorshipServicesFromTemplateByWeekdayDto,
    CreateWorshipServiceTypeDto,
    CreateWorshipServiceTypeRoleDto,
    GenerateWorshipAssignmentsMonthDto,
    GenerateWorshipServicesMonthDto,
    UpdateWorshipServiceDto,
    UpdateWorshipServiceTypeDto,
    UpdateWorshipServiceTypeRoleDto,
} from './dto/worship-schedule.dto';
import { ServiceAssignment } from './entities/service-assignment.entity';
import { ServiceRole } from './entities/service-role.entity';
import { ServingGroup } from './entities/serving-group.entity';
import { WorshipService } from './entities/worship-service.entity';
import { WorshipServiceTypeRole } from './entities/worship-service-type-role.entity';
import { WorshipServiceType } from './entities/worship-service-type.entity';
import { AssignmentStatus } from './enums/assignment-status.enum';
import { Weekday } from './enums/weekday.enum';
import { WorshipServiceStatus } from './enums/worship-service-status.enum';
import { EligibilityService } from './eligibility.service';
import { Member } from '../member/entities/member.entity';
import {
    CHURCH_TIMEZONE,
    combineDateWithTimeInChurchTimezone,
} from '../../shared/utils/church-datetime';

interface PlannedMonthService {
    type: WorshipServiceType;
    scheduledAt: Date;
}

interface AutoAssignPreviewSlot {
    scheduledAt: Date;
    serviceRoleId: number;
    serviceName: string;
    worshipServiceId?: number;
}

interface ServingGroupCandidate {
    id: number;
    memberIds: number[];
}

interface RoleCandidatePool {
    serviceRoleId: number;
    eligibleMemberIds: number[];
    servingGroups: ServingGroupCandidate[];
}

type AssignmentCandidate =
    | { type: 'member'; memberId: number }
    | { type: 'group'; groupId: number; memberIds: number[] };

interface AssignmentBatch {
    scheduledAt: Date;
    serviceRoleId: number;
    requiredQuantity: number;
    serviceName: string;
    worshipServiceId?: number;
    assignments: ServiceAssignment[];
}

export interface AutoAssignWarningItem {
    serviceName: string;
    scheduledAt: string;
    serviceRoleId: number;
    serviceRoleName: string;
    missingCount: number;
}

export interface AutoAssignIncompleteService {
    serviceName: string;
    scheduledAt: string;
    serviceRoleName: string;
    missingCount: number;
}

export interface AutoAssignResult {
    selectedRoleIds: number[];
    totalSlots: number;
    assignedSlots: number;
    unassignedSlots: number;
    warningItems: AutoAssignWarningItem[];
    incompleteServices: AutoAssignIncompleteService[];
}

@Injectable()
export class WorshipScheduleService {
    constructor(
        @InjectRepository(WorshipServiceType)
        private readonly worshipServiceTypeRepository: Repository<WorshipServiceType>,
        @InjectRepository(WorshipServiceTypeRole)
        private readonly worshipServiceTypeRoleRepository: Repository<WorshipServiceTypeRole>,
        @InjectRepository(WorshipService)
        private readonly worshipServiceRepository: Repository<WorshipService>,
        @InjectRepository(ServiceAssignment)
        private readonly serviceAssignmentRepository: Repository<ServiceAssignment>,
        @InjectRepository(ServiceRole)
        private readonly serviceRoleRepository: Repository<ServiceRole>,
        @InjectRepository(Member)
        private readonly memberRepository: Repository<Member>,
        @InjectRepository(ServingGroup)
        private readonly servingGroupRepository: Repository<ServingGroup>,
        private readonly eligibilityService: EligibilityService,
    ) {}

    async createWorshipServiceType(
        dto: CreateWorshipServiceTypeDto,
        userId: number,
    ): Promise<WorshipServiceType> {
        const type = this.worshipServiceTypeRepository.create({
            ...dto,
            createdBy: userId,
            updatedBy: userId,
        });
        return await this.worshipServiceTypeRepository.save(type);
    }

    async findAllWorshipServiceTypes(): Promise<WorshipServiceType[]> {
        return await this.worshipServiceTypeRepository.find({
            relations: ['requiredRoles', 'requiredRoles.serviceRole'],
            order: { name: 'ASC' },
        });
    }

    async findWorshipServiceTypeById(id: number): Promise<WorshipServiceType> {
        const type = await this.worshipServiceTypeRepository.findOne({
            where: { id },
            relations: ['requiredRoles', 'requiredRoles.serviceRole'],
        });
        if (!type) {
            throw new NotFoundException('Tipo de culto não encontrado');
        }
        return type;
    }

    async updateWorshipServiceType(
        id: number,
        dto: UpdateWorshipServiceTypeDto,
        userId: number,
    ): Promise<WorshipServiceType> {
        await this.findWorshipServiceTypeById(id);
        await this.worshipServiceTypeRepository.update(id, {
            ...dto,
            updatedBy: userId,
        });
        return await this.findWorshipServiceTypeById(id);
    }

    async removeWorshipServiceType(id: number, userId: number): Promise<void> {
        await this.findWorshipServiceTypeById(id);
        await this.worshipServiceTypeRepository.update(id, { updatedBy: userId });
        await this.worshipServiceTypeRepository.delete(id);
    }

    async createWorshipServiceTypeRole(
        dto: CreateWorshipServiceTypeRoleDto,
        userId: number,
    ): Promise<WorshipServiceTypeRole> {
        await this.findWorshipServiceTypeById(dto.worshipServiceTypeId);
        await this.ensureServiceRoleExists(dto.serviceRoleId);

        const entity = this.worshipServiceTypeRoleRepository.create({
            ...dto,
            createdBy: userId,
            updatedBy: userId,
        });
        const saved = await this.worshipServiceTypeRoleRepository.save(entity);
        return await this.findWorshipServiceTypeRoleById(saved.id);
    }

    async findAllWorshipServiceTypeRoles(): Promise<WorshipServiceTypeRole[]> {
        return await this.worshipServiceTypeRoleRepository.find({
            relations: ['worshipServiceType', 'serviceRole'],
            order: { sortOrder: 'ASC', id: 'ASC' },
        });
    }

    async findWorshipServiceTypeRoleById(id: number): Promise<WorshipServiceTypeRole> {
        const typeRole = await this.worshipServiceTypeRoleRepository.findOne({
            where: { id },
            relations: ['worshipServiceType', 'serviceRole'],
        });
        if (!typeRole) {
            throw new NotFoundException('Função obrigatória do tipo de culto não encontrada');
        }
        return typeRole;
    }

    async updateWorshipServiceTypeRole(
        id: number,
        dto: UpdateWorshipServiceTypeRoleDto,
        userId: number,
    ): Promise<WorshipServiceTypeRole> {
        const existing = await this.findWorshipServiceTypeRoleById(id);

        if (
            dto.worshipServiceTypeId &&
            dto.worshipServiceTypeId !== existing.worshipServiceTypeId
        ) {
            await this.findWorshipServiceTypeById(dto.worshipServiceTypeId);
        }

        if (dto.serviceRoleId && dto.serviceRoleId !== existing.serviceRoleId) {
            await this.ensureServiceRoleExists(dto.serviceRoleId);
        }

        await this.worshipServiceTypeRoleRepository.update(id, {
            ...dto,
            updatedBy: userId,
        });
        return await this.findWorshipServiceTypeRoleById(id);
    }

    async removeWorshipServiceTypeRole(id: number, userId: number): Promise<void> {
        await this.findWorshipServiceTypeRoleById(id);
        await this.worshipServiceTypeRoleRepository.update(id, { updatedBy: userId });
        await this.worshipServiceTypeRoleRepository.delete(id);
    }

    async createWorshipService(
        dto: CreateWorshipServiceDto,
        userId: number,
    ): Promise<WorshipService> {
        if (dto.worshipServiceTypeId) {
            await this.findWorshipServiceTypeById(dto.worshipServiceTypeId);
        }

        const service = this.worshipServiceRepository.create({
            ...dto,
            scheduledAt: new Date(dto.scheduledAt),
            status: WorshipServiceStatus.DRAFT,
            createdBy: userId,
            updatedBy: userId,
        });
        const saved = await this.worshipServiceRepository.save(service);
        return await this.findWorshipServiceById(saved.id);
    }

    async createWorshipServiceFromTemplate(
        dto: CreateWorshipServiceFromTemplateDto,
        userId: number,
    ): Promise<WorshipService> {
        const type = await this.findWorshipServiceTypeById(dto.worshipServiceTypeId);
        const asDraft = dto.asDraft === true;
        const service = this.worshipServiceRepository.create({
            worshipServiceTypeId: type.id,
            scheduledAt: new Date(dto.scheduledAt),
            name: dto.name || type.name,
            notes: dto.notes,
            status: asDraft ? WorshipServiceStatus.DRAFT : WorshipServiceStatus.PUBLISHED,
            publishedBy: asDraft ? null : userId,
            publishedAt: asDraft ? null : new Date(),
            createdBy: userId,
            updatedBy: userId,
        });
        const savedService = await this.worshipServiceRepository.save(service);

        const typeRoles = await this.worshipServiceTypeRoleRepository.find({
            where: { worshipServiceTypeId: type.id },
            order: { sortOrder: 'ASC', id: 'ASC' },
        });

        const assignments: ServiceAssignment[] = [];
        for (const typeRole of typeRoles) {
            const quantity = typeRole.quantity || 1;
            for (let slot = 1; slot <= quantity; slot++) {
                assignments.push(
                    this.serviceAssignmentRepository.create({
                        worshipServiceId: savedService.id,
                        serviceRoleId: typeRole.serviceRoleId,
                        slotNumber: slot,
                        status: AssignmentStatus.EMPTY,
                        createdBy: userId,
                        updatedBy: userId,
                    }),
                );
            }
        }

        if (assignments.length > 0) {
            await this.serviceAssignmentRepository.save(assignments);
        }

        return await this.findWorshipServiceById(savedService.id);
    }

    async createWorshipServicesFromTemplateByWeekday(
        dto: CreateWorshipServicesFromTemplateByWeekdayDto,
        userId: number,
    ): Promise<WorshipService[]> {
        const type = await this.findWorshipServiceTypeById(dto.worshipServiceTypeId);
        const weekday = dto.weekday ?? type.defaultWeekday;

        if (!weekday) {
            throw new BadRequestException(
                'Informe o dia da semana ou configure um dia padrão no modelo',
            );
        }

        const jsWeekday = this.mapWeekdayToJsWeekday(weekday);
        if (jsWeekday === null) {
            throw new BadRequestException('Dia da semana inválido');
        }

        const startFrom = dto.startFrom ? new Date(dto.startFrom) : new Date();
        startFrom.setHours(0, 0, 0, 0);

        const dates = this.getNextWeekdayOccurrences(startFrom, jsWeekday, dto.count);
        const time = type.defaultTime || '19:00';
        const createdServices: WorshipService[] = [];

        for (const date of dates) {
            const scheduledAt = this.combineDateWithTime(date, time);

            const existing = await this.worshipServiceRepository.findOne({
                where: {
                    worshipServiceTypeId: type.id,
                    scheduledAt,
                },
            });

            if (!existing) {
                const created = await this.createWorshipServiceFromTemplate(
                    {
                        worshipServiceTypeId: type.id,
                        scheduledAt: scheduledAt.toISOString(),
                        name: dto.name || type.name,
                        notes: dto.notes,
                        asDraft: dto.asDraft,
                    },
                    userId,
                );
                createdServices.push(created);
            }
        }

        return createdServices;
    }

    async generateInstancesForMonth(
        dto: GenerateWorshipServicesMonthDto,
        userId: number,
    ): Promise<{
        createdServices: WorshipService[];
        requiresConfirmation: boolean;
        warningMessage?: string;
        autoAssign?: AutoAssignResult;
    }> {
        const createdServices: WorshipService[] = [];
        const selectedRoleIds = Array.from(new Set(dto.autoAssignRoleIds || []));

        if (selectedRoleIds.length > 0) {
            await this.validateSelectedRoleIds(selectedRoleIds);
        }

        const activeTypes = await this.worshipServiceTypeRepository.find({
            where: { isActive: true },
            relations: ['requiredRoles', 'requiredRoles.serviceRole'],
        });
        const plannedServices = await this.planMonthServices(activeTypes, dto.month, dto.year);

        if (selectedRoleIds.length > 0) {
            const preview = await this.previewMonthAutoAssignment(
                plannedServices,
                selectedRoleIds,
                dto.month,
                dto.year,
            );

            if (preview.unassignedSlots > 0 && !dto.proceedWithWarnings) {
                return {
                    createdServices: [],
                    requiresConfirmation: true,
                    warningMessage: this.buildAutoAssignWarningMessage(preview.warningItems),
                    autoAssign: preview,
                };
            }
        }

        for (const plannedService of plannedServices) {
            const created = await this.createWorshipServiceFromTemplate(
                {
                    worshipServiceTypeId: plannedService.type.id,
                    scheduledAt: plannedService.scheduledAt.toISOString(),
                    name: plannedService.type.name,
                },
                userId,
            );
            createdServices.push(created);
        }

        if (selectedRoleIds.length === 0 || createdServices.length === 0) {
            return {
                createdServices,
                requiresConfirmation: false,
            };
        }

        const autoAssign = await this.runAutoAssignmentOnServices(
            createdServices,
            selectedRoleIds,
            dto.month,
            dto.year,
            {
                excludeWorshipServiceIds: createdServices.map((service) => service.id),
                persist: true,
                userId,
            },
        );

        return {
            createdServices,
            requiresConfirmation: false,
            warningMessage:
                autoAssign.unassignedSlots > 0
                    ? this.buildAutoAssignWarningMessage(autoAssign.warningItems)
                    : undefined,
            autoAssign,
        };
    }

    async generateAssignmentsForMonth(
        dto: GenerateWorshipAssignmentsMonthDto,
        userId: number,
    ): Promise<{
        createdServices: WorshipService[];
        requiresConfirmation: boolean;
        warningMessage?: string;
        autoAssign?: AutoAssignResult;
    }> {
        const selectedRoleIds = await this.validateSelectedRoleIds(dto.autoAssignRoleIds);
        const services = await this.findWorshipServicesByMonth(dto.month, dto.year);

        if (services.length === 0) {
            throw new BadRequestException('Nenhum culto encontrado para este mês');
        }

        const batches = this.buildAssignmentBatchesFromServices(services, selectedRoleIds, {
            onlyUnassigned: true,
        });

        if (batches.length === 0 || batches.every((batch) => batch.assignments.length === 0)) {
            throw new BadRequestException(
                'Não há vagas em aberto para as funções selecionadas neste mês',
            );
        }

        const preview = await this.runAutoAssignmentOnServices(
            services,
            selectedRoleIds,
            dto.month,
            dto.year,
            { onlyUnassigned: true },
        );

        if (preview.unassignedSlots > 0 && !dto.proceedWithWarnings) {
            return {
                createdServices: [],
                requiresConfirmation: true,
                warningMessage: this.buildAutoAssignWarningMessage(preview.warningItems),
                autoAssign: preview,
            };
        }

        const autoAssign = await this.runAutoAssignmentOnServices(
            services,
            selectedRoleIds,
            dto.month,
            dto.year,
            { onlyUnassigned: true, persist: true, userId },
        );

        return {
            createdServices: [],
            requiresConfirmation: false,
            warningMessage:
                autoAssign.unassignedSlots > 0
                    ? this.buildAutoAssignWarningMessage(autoAssign.warningItems)
                    : undefined,
            autoAssign,
        };
    }

    private async validateSelectedRoleIds(roleIds: number[]): Promise<number[]> {
        const selectedRoleIds = Array.from(new Set(roleIds || []));

        if (selectedRoleIds.length === 0) {
            throw new BadRequestException('Selecione ao menos uma função');
        }

        const existingRoles = await this.serviceRoleRepository.find({
            where: { id: In(selectedRoleIds), isActive: true },
        });

        if (existingRoles.length !== selectedRoleIds.length) {
            throw new BadRequestException(
                'Uma ou mais funções selecionadas não existem ou estão inativas',
            );
        }

        return selectedRoleIds;
    }

    private async planMonthServices(
        activeTypes: WorshipServiceType[],
        month: number,
        year: number,
    ): Promise<PlannedMonthService[]> {
        const planned: PlannedMonthService[] = [];
        const monthStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
        const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

        for (const type of activeTypes) {
            if (!type.defaultWeekday) continue;
            const jsWeekday = this.mapWeekdayToJsWeekday(type.defaultWeekday);
            if (jsWeekday === null) continue;

            const dateCursor = new Date(monthStart);
            while (dateCursor <= monthEnd) {
                if (dateCursor.getDay() === jsWeekday) {
                    const scheduledAt = this.combineDateWithTime(
                        dateCursor,
                        type.defaultTime || '19:00',
                    );
                    const existing = await this.worshipServiceRepository.findOne({
                        where: { worshipServiceTypeId: type.id, scheduledAt },
                    });
                    if (!existing) {
                        planned.push({ type, scheduledAt });
                    }
                }
                dateCursor.setDate(dateCursor.getDate() + 1);
            }
        }

        return planned;
    }

    private getWeekKey(date: Date): string {
        const value = DateTime.fromJSDate(date).setZone(CHURCH_TIMEZONE);
        return `${value.weekYear}-W${String(value.weekNumber).padStart(2, '0')}`;
    }

    private getMemberLoad(memberLoad: Map<number, number>, memberId: number): number {
        return memberLoad.get(memberId) || 0;
    }

    private getGroupLoad(memberLoad: Map<number, number>, memberIds: number[]): number {
        return memberIds.reduce(
            (sum, memberId) => sum + this.getMemberLoad(memberLoad, memberId),
            0,
        );
    }

    private areMembersAvailable(memberIds: number[], usedInWeek: Set<number>): boolean {
        return memberIds.every((memberId) => !usedInWeek.has(memberId));
    }

    private pickLeastLoadedRandomCandidate(
        candidates: AssignmentCandidate[],
        usedInWeek: Set<number>,
        memberLoad: Map<number, number>,
    ): AssignmentCandidate | null {
        const available = candidates.filter((candidate) => {
            if (candidate.type === 'member') {
                return !usedInWeek.has(candidate.memberId);
            }
            return this.areMembersAvailable(candidate.memberIds, usedInWeek);
        });

        if (available.length === 0) return null;

        let minLoad = Number.MAX_SAFE_INTEGER;
        for (const candidate of available) {
            const load =
                candidate.type === 'member'
                    ? this.getMemberLoad(memberLoad, candidate.memberId)
                    : this.getGroupLoad(memberLoad, candidate.memberIds);
            minLoad = Math.min(minLoad, load);
        }

        const leastLoaded = available.filter((candidate) => {
            const load =
                candidate.type === 'member'
                    ? this.getMemberLoad(memberLoad, candidate.memberId)
                    : this.getGroupLoad(memberLoad, candidate.memberIds);
            return load === minLoad;
        });

        return leastLoaded[Math.floor(Math.random() * leastLoaded.length)] || null;
    }

    private async buildRoleCandidatePools(
        selectedRoleIds: number[],
    ): Promise<Map<number, RoleCandidatePool>> {
        const pools = new Map<number, RoleCandidatePool>();

        for (const roleId of selectedRoleIds) {
            const members = await this.eligibilityService.getEligibleMembers(roleId);
            const eligibleMemberIds = members.map((member) => member.id);

            const servingGroups = await this.servingGroupRepository.find({
                where: { serviceRoleId: roleId, isActive: true },
                relations: ['members'],
            });

            const validGroups: ServingGroupCandidate[] = [];

            for (const group of servingGroups) {
                const memberIds = (group.members || []).map((member) => member.memberId);
                if (memberIds.length < 2) continue;

                const activeMembers = await this.memberRepository.find({
                    where: { id: In(memberIds), isActive: true },
                });
                if (activeMembers.length !== memberIds.length) continue;

                validGroups.push({ id: group.id, memberIds });
            }

            pools.set(roleId, {
                serviceRoleId: roleId,
                eligibleMemberIds,
                servingGroups: validGroups,
            });
        }

        return pools;
    }

    private getMembersInServingGroups(pool: RoleCandidatePool): Set<number> {
        const memberIds = new Set<number>();
        for (const group of pool.servingGroups) {
            for (const memberId of group.memberIds) {
                memberIds.add(memberId);
            }
        }
        return memberIds;
    }

    private getIndividualMemberIds(pool: RoleCandidatePool): number[] {
        const groupMemberIds = this.getMembersInServingGroups(pool);
        return pool.eligibleMemberIds.filter((memberId) => !groupMemberIds.has(memberId));
    }

    private buildAssignmentCandidates(
        pool: RoleCandidatePool,
        remainingSlots: number,
        usedInWeek: Set<number>,
    ): AssignmentCandidate[] {
        const candidates: AssignmentCandidate[] = [];

        for (const group of pool.servingGroups) {
            if (group.memberIds.length < 2) continue;
            if (remainingSlots < group.memberIds.length) continue;
            if (this.areMembersAvailable(group.memberIds, usedInWeek)) {
                candidates.push({
                    type: 'group',
                    groupId: group.id,
                    memberIds: group.memberIds,
                });
            }
        }

        for (const memberId of this.getIndividualMemberIds(pool)) {
            if (!usedInWeek.has(memberId)) {
                candidates.push({ type: 'member', memberId });
            }
        }

        return candidates;
    }

    private lockMembers(
        memberIds: number[],
        weekKey: string,
        locks: Map<string, Set<number>>,
        memberLoad: Map<number, number>,
    ): void {
        if (!locks.has(weekKey)) locks.set(weekKey, new Set<number>());
        const weekLocks = locks.get(weekKey)!;

        for (const memberId of memberIds) {
            weekLocks.add(memberId);
            memberLoad.set(memberId, (memberLoad.get(memberId) || 0) + 1);
        }
    }

    private assignMembersToBatchSlots(
        batch: AssignmentBatch,
        pools: Map<number, RoleCandidatePool>,
        locks: Map<string, Set<number>>,
        memberLoad: Map<number, number>,
        userId: number | null,
        now: Date | null,
    ): { assignedSlots: number; unassigned: AutoAssignPreviewSlot[] } {
        const pool = pools.get(batch.serviceRoleId);
        if (!pool) {
            return {
                assignedSlots: 0,
                unassigned: batch.assignments.map(() => ({
                    scheduledAt: batch.scheduledAt,
                    serviceRoleId: batch.serviceRoleId,
                    serviceName: batch.serviceName,
                    worshipServiceId: batch.worshipServiceId,
                })),
            };
        }

        const weekKey = this.getWeekKey(batch.scheduledAt);
        if (!locks.has(weekKey)) locks.set(weekKey, new Set<number>());

        const openAssignments = [...batch.assignments];
        const unassigned: AutoAssignPreviewSlot[] = [];
        let assignedSlots = 0;

        while (openAssignments.length > 0) {
            const candidates = this.buildAssignmentCandidates(
                pool,
                openAssignments.length,
                locks.get(weekKey)!,
            );
            const chosen = this.pickLeastLoadedRandomCandidate(
                candidates,
                locks.get(weekKey)!,
                memberLoad,
            );

            if (!chosen) {
                for (let i = 0; i < openAssignments.length; i++) {
                    unassigned.push({
                        scheduledAt: batch.scheduledAt,
                        serviceRoleId: batch.serviceRoleId,
                        serviceName: batch.serviceName,
                        worshipServiceId: batch.worshipServiceId,
                    });
                }
                break;
            }

            if (chosen.type === 'group') {
                const slotsToFill = openAssignments.splice(0, chosen.memberIds.length);
                for (let index = 0; index < slotsToFill.length; index++) {
                    const assignment = slotsToFill[index];
                    const memberId = chosen.memberIds[index];
                    if (!memberId) continue;

                    if (userId !== null && now !== null) {
                        assignment.memberId = memberId;
                        assignment.servingGroupId = chosen.groupId;
                        assignment.status = AssignmentStatus.CONFIRMED;
                        assignment.assignedBy = userId;
                        assignment.assignedAt = now;
                        assignment.updatedBy = userId;
                    }

                    assignedSlots += 1;
                }

                this.lockMembers(chosen.memberIds, weekKey, locks, memberLoad);
                continue;
            }

            const assignment = openAssignments.shift();
            if (!assignment) break;

            if (userId !== null && now !== null) {
                assignment.memberId = chosen.memberId;
                assignment.servingGroupId = null;
                assignment.status = AssignmentStatus.CONFIRMED;
                assignment.assignedBy = userId;
                assignment.assignedAt = now;
                assignment.updatedBy = userId;
            }

            this.lockMembers([chosen.memberId], weekKey, locks, memberLoad);
            assignedSlots += 1;
        }

        return { assignedSlots, unassigned };
    }

    private formatChurchDateTime(value: string | Date): string {
        const dateTime =
            value instanceof Date
                ? DateTime.fromJSDate(value, { zone: CHURCH_TIMEZONE })
                : DateTime.fromISO(value, { zone: CHURCH_TIMEZONE });

        return dateTime.setLocale('pt-BR').toFormat('dd/MM/yyyy, HH:mm');
    }

    private async getServiceRoleNames(roleIds: number[]): Promise<Map<number, string>> {
        const uniqueRoleIds = Array.from(new Set(roleIds));
        if (uniqueRoleIds.length === 0) {
            return new Map();
        }

        const roles = await this.serviceRoleRepository.find({
            where: { id: In(uniqueRoleIds) },
        });

        return new Map(roles.map((role) => [role.id, role.name]));
    }

    private async summarizeWarningItems(
        slots: AutoAssignPreviewSlot[],
    ): Promise<AutoAssignWarningItem[]> {
        if (slots.length === 0) {
            return [];
        }

        const roleNames = await this.getServiceRoleNames(slots.map((slot) => slot.serviceRoleId));
        const grouped = new Map<string, AutoAssignWarningItem>();

        for (const slot of slots) {
            const mapKey = `${slot.worshipServiceId ?? slot.serviceName}:${slot.scheduledAt.toISOString()}:${slot.serviceRoleId}`;
            const current = grouped.get(mapKey);
            if (current) {
                current.missingCount += 1;
                continue;
            }

            grouped.set(mapKey, {
                serviceName: slot.serviceName,
                scheduledAt: slot.scheduledAt.toISOString(),
                serviceRoleId: slot.serviceRoleId,
                serviceRoleName: roleNames.get(slot.serviceRoleId) || 'Função',
                missingCount: 1,
            });
        }

        return Array.from(grouped.values()).sort(
            (a, b) =>
                new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime() ||
                a.serviceRoleName.localeCompare(b.serviceRoleName, 'pt-BR'),
        );
    }

    private buildAutoAssignWarningMessage(items: AutoAssignWarningItem[]): string {
        if (items.length === 0) return '';
        const lines = items.map((item) => {
            const date = this.formatChurchDateTime(item.scheduledAt);
            const slotLabel = item.missingCount === 1 ? '1 vaga' : `${item.missingCount} vagas`;
            return `• ${item.serviceName} — ${date}: ${slotLabel} de ${item.serviceRoleName}`;
        });
        return [
            'Não há pessoas suficientes para respeitar a regra de não repetir membros na mesma semana.',
            '',
            'Cultos que podem ficar com vagas sem atribuição:',
            ...lines,
            '',
            'Deseja continuar mesmo assim?',
        ].join('\n');
    }

    private async getWeeklyLocksFromExistingAssignments(
        month: number,
        year: number,
        selectedRoleIds: number[],
        excludeWorshipServiceIds: number[] = [],
    ): Promise<Map<string, Set<number>>> {
        const locks = new Map<string, Set<number>>();
        const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
        const end = new Date(year, month, 0, 23, 59, 59, 999);

        const qb = this.serviceAssignmentRepository
            .createQueryBuilder('assignment')
            .innerJoinAndSelect('assignment.worshipService', 'worshipService')
            .leftJoinAndSelect('assignment.servingGroup', 'servingGroup')
            .leftJoinAndSelect('servingGroup.members', 'groupMembers')
            .where('assignment.service_role_id IN (:...roleIds)', { roleIds: selectedRoleIds })
            .andWhere(
                '(assignment.member_id IS NOT NULL OR assignment.serving_group_id IS NOT NULL)',
            )
            .andWhere('worshipService.scheduled_at BETWEEN :start AND :end', { start, end });

        if (excludeWorshipServiceIds.length > 0) {
            qb.andWhere('assignment.worship_service_id NOT IN (:...excludedIds)', {
                excludedIds: excludeWorshipServiceIds,
            });
        }

        const existingAssignments = await qb.getMany();
        for (const assignment of existingAssignments) {
            if (!assignment.worshipService?.scheduledAt) continue;
            const weekKey = this.getWeekKey(assignment.worshipService.scheduledAt);
            if (!locks.has(weekKey)) locks.set(weekKey, new Set<number>());

            if (assignment.memberId) {
                locks.get(weekKey)!.add(assignment.memberId);
            }

            if (assignment.servingGroup?.members?.length) {
                for (const groupMember of assignment.servingGroup.members) {
                    locks.get(weekKey)!.add(groupMember.memberId);
                }
            }
        }

        return locks;
    }

    private buildPreviewBatches(
        plannedServices: PlannedMonthService[],
        selectedRoleIds: number[],
    ): AssignmentBatch[] {
        const selectedRoleSet = new Set(selectedRoleIds);
        const batches: AssignmentBatch[] = [];

        for (const planned of plannedServices) {
            for (const requiredRole of planned.type.requiredRoles || []) {
                if (!selectedRoleSet.has(requiredRole.serviceRoleId)) continue;

                const requiredQuantity = requiredRole.quantity || 1;
                batches.push({
                    scheduledAt: planned.scheduledAt,
                    serviceRoleId: requiredRole.serviceRoleId,
                    requiredQuantity,
                    serviceName: planned.type.name,
                    assignments: Array.from(
                        { length: requiredQuantity },
                        () => ({}) as ServiceAssignment,
                    ),
                });
            }
        }

        return batches.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
    }

    private buildAssignmentBatchesFromServices(
        services: WorshipService[],
        selectedRoleIds: number[],
        options?: { onlyUnassigned?: boolean },
    ): AssignmentBatch[] {
        const selectedRoleSet = new Set(selectedRoleIds);
        const batchMap = new Map<string, AssignmentBatch>();

        for (const service of services) {
            const serviceName = service.name || service.worshipServiceType?.name || 'Culto';
            const roleTotals = new Map<number, number>();
            for (const assignment of service.assignments || []) {
                if (!selectedRoleSet.has(assignment.serviceRoleId)) continue;
                roleTotals.set(
                    assignment.serviceRoleId,
                    (roleTotals.get(assignment.serviceRoleId) || 0) + 1,
                );
            }

            for (const assignment of service.assignments || []) {
                if (!selectedRoleSet.has(assignment.serviceRoleId)) continue;
                if (options?.onlyUnassigned && (assignment.memberId || assignment.servingGroupId)) {
                    continue;
                }

                const key = `${service.id}:${assignment.serviceRoleId}`;
                if (!batchMap.has(key)) {
                    batchMap.set(key, {
                        scheduledAt: new Date(service.scheduledAt),
                        serviceRoleId: assignment.serviceRoleId,
                        requiredQuantity: roleTotals.get(assignment.serviceRoleId) || 1,
                        serviceName,
                        worshipServiceId: service.id,
                        assignments: [],
                    });
                }

                batchMap.get(key)!.assignments.push(assignment);
            }
        }

        const batches = Array.from(batchMap.values());
        for (const batch of batches) {
            batch.assignments.sort((a, b) => a.slotNumber - b.slotNumber);
        }

        return batches.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
    }

    private async runAutoAssignmentOnServices(
        services: WorshipService[],
        selectedRoleIds: number[],
        month: number,
        year: number,
        options?: {
            onlyUnassigned?: boolean;
            excludeWorshipServiceIds?: number[];
            persist?: boolean;
            userId?: number;
        },
    ): Promise<AutoAssignResult> {
        const pools = await this.buildRoleCandidatePools(selectedRoleIds);
        const batches = this.buildAssignmentBatchesFromServices(services, selectedRoleIds, {
            onlyUnassigned: options?.onlyUnassigned,
        });
        const locks = await this.getWeeklyLocksFromExistingAssignments(
            month,
            year,
            selectedRoleIds,
            options?.excludeWorshipServiceIds || [],
        );
        const memberLoad = new Map<number, number>();
        const now = options?.persist ? new Date() : null;
        const unassigned: AutoAssignPreviewSlot[] = [];
        let assignedSlots = 0;
        let totalSlots = 0;
        const assignmentsToSave: ServiceAssignment[] = [];

        for (const batch of batches) {
            totalSlots += batch.assignments.length;
            const result = this.assignMembersToBatchSlots(
                batch,
                pools,
                locks,
                memberLoad,
                options?.persist ? options.userId ?? null : null,
                now,
            );
            assignedSlots += result.assignedSlots;
            unassigned.push(...result.unassigned);
            assignmentsToSave.push(...batch.assignments);
        }

        if (options?.persist && assignmentsToSave.length > 0) {
            await this.serviceAssignmentRepository.save(assignmentsToSave);
        }

        const warningItems = await this.summarizeWarningItems(unassigned);

        return {
            selectedRoleIds,
            totalSlots,
            assignedSlots,
            unassignedSlots: unassigned.length,
            warningItems,
            incompleteServices: warningItems.map(
                ({ serviceName, scheduledAt, serviceRoleName, missingCount }) => ({
                    serviceName,
                    scheduledAt,
                    serviceRoleName,
                    missingCount,
                }),
            ),
        };
    }

    private async previewMonthAutoAssignment(
        plannedServices: PlannedMonthService[],
        selectedRoleIds: number[],
        month: number,
        year: number,
    ): Promise<AutoAssignResult> {
        const pools = await this.buildRoleCandidatePools(selectedRoleIds);
        const batches = this.buildPreviewBatches(plannedServices, selectedRoleIds);
        const locks = await this.getWeeklyLocksFromExistingAssignments(
            month,
            year,
            selectedRoleIds,
        );
        const memberLoad = new Map<number, number>();
        const unassigned: AutoAssignPreviewSlot[] = [];
        let assignedSlots = 0;
        let totalSlots = 0;

        for (const batch of batches) {
            totalSlots += batch.assignments.length;
            const result = this.assignMembersToBatchSlots(
                batch,
                pools,
                locks,
                memberLoad,
                null,
                null,
            );
            assignedSlots += result.assignedSlots;
            unassigned.push(...result.unassigned);
        }

        const warningItems = await this.summarizeWarningItems(unassigned);

        return {
            selectedRoleIds,
            totalSlots,
            assignedSlots,
            unassignedSlots: unassigned.length,
            warningItems,
            incompleteServices: warningItems.map(
                ({ serviceName, scheduledAt, serviceRoleName, missingCount }) => ({
                    serviceName,
                    scheduledAt,
                    serviceRoleName,
                    missingCount,
                }),
            ),
        };
    }

    private async autoAssignMembersToGeneratedServices(
        createdServices: WorshipService[],
        selectedRoleIds: number[],
        month: number,
        year: number,
        userId: number,
    ): Promise<AutoAssignResult> {
        return await this.runAutoAssignmentOnServices(
            createdServices,
            selectedRoleIds,
            month,
            year,
            {
                excludeWorshipServiceIds: createdServices.map((service) => service.id),
                persist: true,
                userId,
            },
        );
    }

    async findAllWorshipServices(): Promise<WorshipService[]> {
        return await this.worshipServiceRepository.find({
            relations: [
                'worshipServiceType',
                'worshipServiceType.requiredRoles',
                'assignments',
                'assignments.serviceRole',
                'assignments.member',
                'assignments.servingGroup',
            ],
            order: { scheduledAt: 'ASC', id: 'ASC' },
        });
    }

    async findWorshipServiceById(id: number): Promise<WorshipService> {
        const service = await this.worshipServiceRepository.findOne({
            where: { id },
            relations: [
                'worshipServiceType',
                'worshipServiceType.requiredRoles',
                'assignments',
                'assignments.serviceRole',
                'assignments.member',
                'assignments.servingGroup',
            ],
        });
        if (!service) {
            throw new NotFoundException('Culto não encontrado');
        }
        return service;
    }

    async findWorshipServicesByMonth(month: number, year: number): Promise<WorshipService[]> {
        const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
        const end = new Date(year, month, 0, 23, 59, 59, 999);

        return await this.worshipServiceRepository.find({
            where: {
                scheduledAt: Between(start, end),
            },
            relations: [
                'worshipServiceType',
                'worshipServiceType.requiredRoles',
                'assignments',
                'assignments.serviceRole',
                'assignments.member',
                'assignments.servingGroup',
            ],
            order: { scheduledAt: 'ASC', id: 'ASC' },
        });
    }

    async updateWorshipService(
        id: number,
        dto: UpdateWorshipServiceDto,
        userId: number,
    ): Promise<WorshipService> {
        const existing = await this.findWorshipServiceById(id);

        if (existing.status === WorshipServiceStatus.COMPLETED) {
            throw new BadRequestException('Não é permitido editar um culto concluído');
        }

        if (
            dto.worshipServiceTypeId &&
            dto.worshipServiceTypeId !== existing.worshipServiceTypeId
        ) {
            await this.findWorshipServiceTypeById(dto.worshipServiceTypeId);
        }

        await this.worshipServiceRepository.update(id, {
            ...dto,
            scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
            updatedBy: userId,
        });
        return await this.findWorshipServiceById(id);
    }

    async removeWorshipService(id: number, userId: number): Promise<void> {
        await this.findWorshipServiceById(id);
        await this.worshipServiceRepository.update(id, { updatedBy: userId });
        await this.worshipServiceRepository.delete(id);
    }

    async removeWorshipServicesForMonth(
        month: number,
        year: number,
        userId: number,
    ): Promise<{ deletedCount: number }> {
        const services = await this.findWorshipServicesByMonth(month, year);
        if (services.length === 0) {
            return { deletedCount: 0 };
        }

        const ids = services.map((service) => service.id);
        await this.worshipServiceRepository.update({ id: In(ids) }, { updatedBy: userId });
        await this.worshipServiceRepository.delete({ id: In(ids) });

        return { deletedCount: ids.length };
    }

    async clearWorshipServiceAssignmentsForMonth(
        month: number,
        year: number,
        userId: number,
    ): Promise<{ clearedCount: number }> {
        const services = await this.findWorshipServicesByMonth(month, year);
        if (services.length === 0) {
            return { clearedCount: 0 };
        }

        const serviceIds = services.map((service) => service.id);
        const assignments = await this.serviceAssignmentRepository.find({
            where: { worshipServiceId: In(serviceIds) },
        });

        const assignmentsToClear = assignments.filter(
            (assignment) =>
                assignment.memberId ||
                assignment.servingGroupId ||
                assignment.notes ||
                assignment.status !== AssignmentStatus.EMPTY,
        );

        if (assignmentsToClear.length === 0) {
            return { clearedCount: 0 };
        }

        for (const assignment of assignmentsToClear) {
            assignment.memberId = null;
            assignment.servingGroupId = null;
            assignment.notes = null;
            assignment.status = AssignmentStatus.EMPTY;
            assignment.assignedBy = null;
            assignment.assignedAt = null;
            assignment.updatedBy = userId;
        }

        await this.serviceAssignmentRepository.save(assignmentsToClear);

        return { clearedCount: assignmentsToClear.length };
    }

    async assignMemberOrGroup(
        worshipServiceId: number,
        dto: AssignServiceAssignmentDto,
        userId: number,
    ): Promise<ServiceAssignment> {
        await this.findWorshipServiceById(worshipServiceId);

        if ((!dto.memberId && !dto.servingGroupId) || (dto.memberId && dto.servingGroupId)) {
            throw new BadRequestException(
                'Informe apenas memberId ou servingGroupId para atribuição',
            );
        }

        const assignment = await this.serviceAssignmentRepository.findOne({
            where: { id: dto.assignmentId, worshipServiceId },
            relations: ['serviceRole'],
        });
        if (!assignment) {
            throw new NotFoundException('Vaga de escala não encontrada');
        }

        if (dto.memberId) {
            await this.ensureMemberExists(dto.memberId);
        }

        if (dto.servingGroupId) {
            await this.ensureServingGroupExists(dto.servingGroupId);
        }

        assignment.memberId = dto.memberId || null;
        assignment.servingGroupId = dto.servingGroupId || null;
        if (dto.notes !== undefined) {
            assignment.notes = dto.notes?.trim() || null;
        }
        assignment.status =
            dto.memberId || dto.servingGroupId
                ? AssignmentStatus.CONFIRMED
                : AssignmentStatus.EMPTY;
        assignment.assignedBy = userId;
        assignment.assignedAt = new Date();
        assignment.updatedBy = userId;

        return await this.serviceAssignmentRepository.save(assignment);
    }

    async publishWorshipService(id: number, userId: number): Promise<WorshipService> {
        const service = await this.findWorshipServiceById(id);
        if (service.status === WorshipServiceStatus.COMPLETED) {
            throw new BadRequestException('Não é possível publicar um culto concluído');
        }

        await this.worshipServiceRepository.update(id, {
            status: WorshipServiceStatus.PUBLISHED,
            publishedBy: userId,
            publishedAt: new Date(),
            updatedBy: userId,
        });
        return await this.findWorshipServiceById(id);
    }

    async completeWorshipService(id: number, userId: number): Promise<WorshipService> {
        await this.findWorshipServiceById(id);
        await this.worshipServiceRepository.update(id, {
            status: WorshipServiceStatus.COMPLETED,
            updatedBy: userId,
        });
        return await this.findWorshipServiceById(id);
    }

    async copyAssignmentsFromAnotherService(
        targetWorshipServiceId: number,
        dto: CopyWorshipServiceAssignmentsDto,
        userId: number,
    ): Promise<WorshipService> {
        const targetService = await this.findWorshipServiceById(targetWorshipServiceId);
        if (targetService.status === WorshipServiceStatus.COMPLETED) {
            throw new BadRequestException('Não é possível copiar atribuições para culto concluído');
        }

        await this.findWorshipServiceById(dto.sourceWorshipServiceId);

        const sourceAssignments = await this.serviceAssignmentRepository.find({
            where: { worshipServiceId: dto.sourceWorshipServiceId },
        });

        const targetAssignments = await this.serviceAssignmentRepository.find({
            where: { worshipServiceId: targetWorshipServiceId },
        });

        const targetMap = new Map<string, ServiceAssignment>();
        for (const target of targetAssignments) {
            const key = `${target.serviceRoleId}:${target.slotNumber}`;
            targetMap.set(key, target);
        }

        for (const source of sourceAssignments) {
            const key = `${source.serviceRoleId}:${source.slotNumber}`;
            const target = targetMap.get(key);

            if (!target) {
                continue;
            }

            target.memberId = source.memberId || null;
            target.servingGroupId = source.servingGroupId || null;
            target.notes = source.notes;
            target.status =
                source.memberId || source.servingGroupId
                    ? AssignmentStatus.CONFIRMED
                    : AssignmentStatus.EMPTY;
            target.assignedBy = source.memberId || source.servingGroupId ? userId : null;
            target.assignedAt = source.memberId || source.servingGroupId ? new Date() : null;
            target.updatedBy = userId;
        }

        if (targetAssignments.length > 0) {
            await this.serviceAssignmentRepository.save(targetAssignments);
        }

        return await this.findWorshipServiceById(targetWorshipServiceId);
    }

    async getEligibleMembersForAssignmentSlot(assignmentId: number): Promise<Member[]> {
        const assignment = await this.serviceAssignmentRepository.findOne({
            where: { id: assignmentId },
        });
        if (!assignment) {
            throw new NotFoundException('Vaga de escala não encontrada');
        }

        return await this.eligibilityService.getEligibleMembers(assignment.serviceRoleId);
    }

    private mapWeekdayToJsWeekday(weekday: Weekday): number | null {
        const map: Record<Weekday, number> = {
            [Weekday.SUNDAY]: 0,
            [Weekday.MONDAY]: 1,
            [Weekday.TUESDAY]: 2,
            [Weekday.WEDNESDAY]: 3,
            [Weekday.THURSDAY]: 4,
            [Weekday.FRIDAY]: 5,
            [Weekday.SATURDAY]: 6,
        };
        return map[weekday] ?? null;
    }

    private combineDateWithTime(date: Date, time: string): Date {
        return combineDateWithTimeInChurchTimezone(date, time);
    }

    private getNextWeekdayOccurrences(startFrom: Date, jsWeekday: number, count: number): Date[] {
        const dates: Date[] = [];
        const cursor = new Date(startFrom);

        while (cursor.getDay() !== jsWeekday) {
            cursor.setDate(cursor.getDate() + 1);
        }

        while (dates.length < count) {
            dates.push(new Date(cursor));
            cursor.setDate(cursor.getDate() + 7);
        }

        return dates;
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

    private async ensureServingGroupExists(id: number): Promise<void> {
        const servingGroup = await this.servingGroupRepository.findOne({ where: { id } });
        if (!servingGroup) {
            throw new NotFoundException('Grupo de serviço não encontrado');
        }
    }
}
