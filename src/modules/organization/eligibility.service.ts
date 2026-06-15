import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Member } from '../member/entities/member.entity';
import { CapabilitySource } from './enums/capability-source.enum';
import { DepartmentRoleEligibility } from './entities/department-role-eligibility.entity';
import { MemberDepartment } from './entities/member-department.entity';
import { MemberServiceCapability } from './entities/member-service-capability.entity';

@Injectable()
export class EligibilityService {
    constructor(
        @InjectRepository(MemberDepartment)
        private readonly memberDepartmentRepository: Repository<MemberDepartment>,
        @InjectRepository(DepartmentRoleEligibility)
        private readonly departmentRoleEligibilityRepository: Repository<DepartmentRoleEligibility>,
        @InjectRepository(MemberServiceCapability)
        private readonly memberServiceCapabilityRepository: Repository<MemberServiceCapability>,
    ) {}

    async syncMemberCapabilitiesFromDepartments(memberId: number): Promise<void> {
        const memberDepartments = await this.memberDepartmentRepository.find({
            where: {
                memberId,
                isActive: true,
                endedAt: IsNull(),
                department: {
                    isActive: true,
                },
            },
            relations: ['department'],
        });

        const departmentIds = memberDepartments.map(
            (memberDepartment) => memberDepartment.departmentId,
        );

        const filteredEligibilities =
            departmentIds.length > 0
                ? await this.departmentRoleEligibilityRepository.find({
                      where: {
                          departmentId: In(departmentIds),
                          serviceRole: {
                              isActive: true,
                          },
                      },
                      relations: ['serviceRole'],
                  })
                : [];

        const defaultRoleIds = new Set(
            filteredEligibilities
                .filter((item) => item.isDefault)
                .map((item) => item.serviceRoleId),
        );

        const existingCapabilities = await this.memberServiceCapabilityRepository.find({
            where: { memberId },
        });

        for (const capability of existingCapabilities) {
            if (capability.source !== CapabilitySource.DEPARTMENT) {
                continue;
            }

            const shouldBeActive = defaultRoleIds.has(capability.serviceRoleId);

            if (capability.isActive !== shouldBeActive) {
                capability.isActive = shouldBeActive;
                await this.memberServiceCapabilityRepository.save(capability);
            }

            if (shouldBeActive) {
                defaultRoleIds.delete(capability.serviceRoleId);
            }
        }

        for (const serviceRoleId of defaultRoleIds) {
            const existingManualCapability = existingCapabilities.find(
                (capability) => capability.serviceRoleId === serviceRoleId,
            );

            if (existingManualCapability) {
                continue;
            }

            const capability = this.memberServiceCapabilityRepository.create({
                memberId,
                serviceRoleId,
                source: CapabilitySource.DEPARTMENT,
                isActive: true,
            });
            await this.memberServiceCapabilityRepository.save(capability);
        }
    }

    async getEligibleMembers(serviceRoleId: number): Promise<Member[]> {
        const memberMap = new Map<number, Member>();

        const capabilities = await this.memberServiceCapabilityRepository.find({
            where: {
                serviceRoleId,
                isActive: true,
            },
            relations: ['member'],
        });

        for (const capability of capabilities) {
            const member = capability.member;
            if (member && member.isActive && !member.deletedAt) {
                memberMap.set(member.id, member);
            }
        }

        const eligibilities = await this.departmentRoleEligibilityRepository.find({
            where: {
                serviceRoleId,
                department: { isActive: true },
                serviceRole: { isActive: true },
            },
        });

        if (eligibilities.length > 0) {
            const departmentIds = eligibilities.map((eligibility) => eligibility.departmentId);
            const memberDepartments = await this.memberDepartmentRepository.find({
                where: {
                    departmentId: In(departmentIds),
                    isActive: true,
                    endedAt: IsNull(),
                },
                relations: ['member'],
            });

            for (const memberDepartment of memberDepartments) {
                const member = memberDepartment.member;
                if (member && member.isActive && !member.deletedAt) {
                    memberMap.set(member.id, member);
                }
            }
        }

        return Array.from(memberMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }
}
