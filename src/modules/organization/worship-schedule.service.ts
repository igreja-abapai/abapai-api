import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import {
    AssignServiceAssignmentDto,
    CopyWorshipServiceAssignmentsDto,
    CreateWorshipServiceDto,
    CreateWorshipServiceFromTemplateDto,
    CreateWorshipServicesFromTemplateByWeekdayDto,
    CreateWorshipServiceTypeDto,
    CreateWorshipServiceTypeRoleDto,
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
import { combineDateWithTimeInChurchTimezone } from '../../shared/utils/church-datetime';

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
    ): Promise<WorshipService[]> {
        const createdServices: WorshipService[] = [];

        const activeTypes = await this.worshipServiceTypeRepository.find({
            where: { isActive: true },
        });

        const monthStart = new Date(dto.year, dto.month - 1, 1, 0, 0, 0, 0);
        const monthEnd = new Date(dto.year, dto.month, 0, 23, 59, 59, 999);

        for (const type of activeTypes) {
            if (!type.defaultWeekday) {
                continue;
            }

            const jsWeekday = this.mapWeekdayToJsWeekday(type.defaultWeekday);
            if (jsWeekday === null) {
                continue;
            }

            const dateCursor = new Date(monthStart);
            while (dateCursor <= monthEnd) {
                if (dateCursor.getDay() === jsWeekday) {
                    const scheduledAt = this.combineDateWithTime(
                        dateCursor,
                        type.defaultTime || '19:00',
                    );

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
                                name: type.name,
                            },
                            userId,
                        );
                        createdServices.push(created);
                    }
                }

                dateCursor.setDate(dateCursor.getDate() + 1);
            }
        }

        return createdServices;
    }

    async findAllWorshipServices(): Promise<WorshipService[]> {
        return await this.worshipServiceRepository.find({
            relations: [
                'worshipServiceType',
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
        assignment.notes = dto.notes;
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
