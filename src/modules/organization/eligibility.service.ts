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
        @InjectRepository(Member)
        private readonly memberRepository: Repository<Member>,
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

        const eligibleRoleIds = new Set(filteredEligibilities.map((item) => item.serviceRoleId));

        const existingCapabilities = await this.memberServiceCapabilityRepository.find({
            where: { memberId },
        });

        for (const capability of existingCapabilities) {
            if (capability.source !== CapabilitySource.DEPARTMENT) {
                continue;
            }

            const shouldBeActive = eligibleRoleIds.has(capability.serviceRoleId);

            if (capability.isActive !== shouldBeActive) {
                capability.isActive = shouldBeActive;
                await this.memberServiceCapabilityRepository.save(capability);
            }

            if (shouldBeActive) {
                eligibleRoleIds.delete(capability.serviceRoleId);
            }
        }

        for (const serviceRoleId of eligibleRoleIds) {
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
        const capabilities = await this.memberServiceCapabilityRepository.find({
            where: {
                serviceRoleId,
                isActive: true,
            },
            relations: ['member'],
        });

        return capabilities
            .map((capability) => capability.member)
            .filter((member) => member && member.isActive && !member.deletedAt);
    }
}
