import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Member } from '../member/entities/member.entity';
import { CapabilitySource } from '../organization/enums/capability-source.enum';
import { ChurchPositionCategory } from '../organization/enums/church-position-category.enum';
import { MemberDepartmentRole } from '../organization/enums/member-department-role.enum';
import { ChurchPosition } from '../organization/entities/church-position.entity';
import { Department } from '../organization/entities/department.entity';
import { DepartmentRoleEligibility } from '../organization/entities/department-role-eligibility.entity';
import { MemberDepartment } from '../organization/entities/member-department.entity';
import { MemberServiceCapability } from '../organization/entities/member-service-capability.entity';
import { ServiceRole } from '../organization/entities/service-role.entity';
import { ServingGroup } from '../organization/entities/serving-group.entity';
import { ServingGroupMember } from '../organization/entities/serving-group-member.entity';

@Injectable()
export class StatsService {
    constructor(
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
        @InjectRepository(Department)
        private departmentRepository: Repository<Department>,
        @InjectRepository(MemberDepartment)
        private memberDepartmentRepository: Repository<MemberDepartment>,
        @InjectRepository(ChurchPosition)
        private churchPositionRepository: Repository<ChurchPosition>,
        @InjectRepository(ServiceRole)
        private serviceRoleRepository: Repository<ServiceRole>,
        @InjectRepository(MemberServiceCapability)
        private memberServiceCapabilityRepository: Repository<MemberServiceCapability>,
        @InjectRepository(DepartmentRoleEligibility)
        private departmentRoleEligibilityRepository: Repository<DepartmentRoleEligibility>,
        @InjectRepository(ServingGroup)
        private servingGroupRepository: Repository<ServingGroup>,
        @InjectRepository(ServingGroupMember)
        private servingGroupMemberRepository: Repository<ServingGroupMember>,
    ) {}

    async getMemberStats() {
        const members = await this.memberRepository.find({
            where: { deletedAt: IsNull() },
        });

        const memberDepartments = await this.memberDepartmentRepository.find({
            where: { isActive: true, endedAt: IsNull() },
        });
        const memberIdsInDepartments = new Set(memberDepartments.map((link) => link.memberId));

        const now = new Date();
        const currentYear = now.getFullYear();

        const totalMembers = members.length;
        if (totalMembers === 0) {
            return this.emptyMemberStats();
        }

        let baptizedCount = 0;
        let totalAge = 0;
        let ageCount = 0;
        let newConverts = 0;
        let activeMembers = 0;
        let inactiveMembers = 0;
        let withoutDepartmentCount = 0;
        let withPositionCount = 0;

        const admissionTypes: Record<string, number> = {};
        const genderCounts: Record<string, number> = {};
        const ageCounts = {
            adolescents: 0,
            youngAdults: 0,
            adults: 0,
            seniors: 0,
        };
        const tenureCounts = {
            over10: 0,
            between5And10: 0,
            between2And5: 0,
            under2: 0,
        };
        const admissionsPerYear: Record<number, number> = {};
        const departuresPerYear: Record<number, number> = {};
        const netGrowthPerYear: Record<number, number> = {};

        members.forEach((m) => {
            if (m.isActive) {
                activeMembers++;
            } else {
                inactiveMembers++;
            }

            if (!memberIdsInDepartments.has(m.id)) {
                withoutDepartmentCount++;
            }

            if (this.memberHasCargo(m)) {
                withPositionCount++;
            }

            if (m.isBaptized) baptizedCount++;

            if (m.birthdate) {
                const age = this.calculateAge(m.birthdate);
                if (age !== null) {
                    totalAge += age;
                    ageCount++;

                    if (age >= 13 && age <= 17) ageCounts.adolescents++;
                    else if (age >= 18 && age <= 29) ageCounts.youngAdults++;
                    else if (age >= 30 && age <= 59) ageCounts.adults++;
                    else if (age >= 60) ageCounts.seniors++;
                }
            }

            if (m.yearOfConversion) {
                const year = parseInt(m.yearOfConversion, 10);
                if (!isNaN(year) && currentYear - year <= 1) {
                    newConverts++;
                }
            }

            const type = m.admissionType || 'Não informado';
            admissionTypes[type] = (admissionTypes[type] || 0) + 1;

            if (m.gender) {
                genderCounts[m.gender] = (genderCounts[m.gender] || 0) + 1;
            }

            if (m.admissionDate) {
                const admission = this.parseDate(m.admissionDate);
                if (admission) {
                    const diffInYears =
                        (now.getTime() - admission.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                    if (diffInYears >= 10) tenureCounts.over10++;
                    else if (diffInYears >= 5) tenureCounts.between5And10++;
                    else if (diffInYears >= 2) tenureCounts.between2And5++;
                    else tenureCounts.under2++;

                    const year = admission.getFullYear();
                    admissionsPerYear[year] = (admissionsPerYear[year] || 0) + 1;
                }
            }

            const departureYear = this.getDepartureYear(m);
            if (departureYear !== null) {
                departuresPerYear[departureYear] = (departuresPerYear[departureYear] || 0) + 1;
            }
        });

        const years = Array.from({ length: 10 }, (_, i) => currentYear - 9 + i);
        for (const year of years) {
            const admissions = admissionsPerYear[year] || 0;
            const departures = departuresPerYear[year] || 0;
            netGrowthPerYear[year] = admissions - departures;
        }

        const withoutPositionCount = totalMembers - withPositionCount;

        return {
            totalMembers,
            activeMembers,
            inactiveMembers,
            withoutDepartmentCount,
            withPositionCount,
            withoutPositionCount,
            withPositionPercentage: ((withPositionCount / totalMembers) * 100).toFixed(1),
            baptizedCount,
            baptizedPercentage: ((baptizedCount / totalMembers) * 100).toFixed(1),
            averageAge: ageCount > 0 ? Math.round(totalAge / ageCount) : 0,
            newConvertsPercentage: ((newConverts / totalMembers) * 100).toFixed(1),
            newConvertsCount: newConverts,
            admissionTypes,
            genderCounts,
            ageCounts,
            tenureCounts,
            admissionsPerYear,
            departuresPerYear,
            netGrowthPerYear,
        };
    }

    async getOrganizationStats() {
        const [
            members,
            departments,
            inactiveDepartmentsCount,
            memberDepartments,
            positions,
            serviceRoles,
            capabilities,
            eligibilities,
            servingGroups,
            servingGroupMembers,
        ] = await Promise.all([
            this.memberRepository.find({
                where: { deletedAt: IsNull() },
                relations: ['primaryPosition'],
            }),
            this.departmentRepository.find({ where: { isActive: true } }),
            this.departmentRepository.count({ where: { isActive: false } }),
            this.memberDepartmentRepository.find({
                where: { isActive: true, endedAt: IsNull() },
                relations: ['department', 'member'],
            }),
            this.churchPositionRepository.find({ where: { isActive: true } }),
            this.serviceRoleRepository.find({ where: { isActive: true } }),
            this.memberServiceCapabilityRepository.find({
                where: { isActive: true },
                relations: ['member'],
            }),
            this.departmentRoleEligibilityRepository.find({
                where: { department: { isActive: true }, serviceRole: { isActive: true } },
                relations: ['department', 'serviceRole'],
            }),
            this.servingGroupRepository.find({ where: { isActive: true } }),
            this.servingGroupMemberRepository.find({ relations: ['servingGroup'] }),
        ]);

        const totalMembers = members.length;

        const linkedMemberIds = new Set<number>();
        const departmentMemberCounts = new Map<number, number>();
        const departmentLeaderIds = new Set<number>();
        const departmentRoleBreakdown = { leader: 0, member: 0, assistant: 0 };
        const memberDepartmentCount = new Map<number, number>();

        for (const link of memberDepartments) {
            const member = link.member;
            if (!member || member.deletedAt || !member.isActive) continue;

            linkedMemberIds.add(link.memberId);
            departmentMemberCounts.set(
                link.departmentId,
                (departmentMemberCounts.get(link.departmentId) || 0) + 1,
            );
            memberDepartmentCount.set(
                link.memberId,
                (memberDepartmentCount.get(link.memberId) || 0) + 1,
            );

            if (link.role === MemberDepartmentRole.LEADER) {
                departmentLeaderIds.add(link.departmentId);
                departmentRoleBreakdown.leader++;
            } else if (link.role === MemberDepartmentRole.ASSISTANT) {
                departmentRoleBreakdown.assistant++;
            } else {
                departmentRoleBreakdown.member++;
            }
        }

        const departmentTypeBreakdown: Record<string, number> = {};
        for (const department of departments) {
            departmentTypeBreakdown[department.type] =
                (departmentTypeBreakdown[department.type] || 0) + 1;
        }

        const membersByDepartment = departments
            .map((department) => ({
                departmentId: department.id,
                name: department.name,
                count: departmentMemberCounts.get(department.id) || 0,
            }))
            .sort((a, b) => b.count - a.count);

        const departmentsWithoutLeader = departments
            .filter((department) => !departmentLeaderIds.has(department.id))
            .map((department) => ({
                id: department.id,
                name: department.name,
                memberCount: departmentMemberCounts.get(department.id) || 0,
            }))
            .sort((a, b) => b.memberCount - a.memberCount);

        let withPrimaryPositionCount = 0;
        let ministerialCount = 0;
        let operationalCount = 0;
        const positionCountMap = new Map<number, number>();

        for (const member of members) {
            if (!this.memberHasCargo(member)) continue;
            withPrimaryPositionCount++;

            if (member.primaryPositionId && member.primaryPosition) {
                positionCountMap.set(
                    member.primaryPositionId,
                    (positionCountMap.get(member.primaryPositionId) || 0) + 1,
                );
                if (member.primaryPosition.category === ChurchPositionCategory.MINISTERIAL) {
                    ministerialCount++;
                } else {
                    operationalCount++;
                }
            }
        }

        const leaderMemberIds = new Set(
            memberDepartments
                .filter(
                    (link) =>
                        link.role === MemberDepartmentRole.LEADER &&
                        link.member?.isActive &&
                        !link.member.deletedAt,
                )
                .map((link) => link.memberId),
        );

        const obreiroMemberIds = new Set<number>();
        for (const member of members) {
            if (
                member.primaryPosition?.category === ChurchPositionCategory.MINISTERIAL ||
                leaderMemberIds.has(member.id)
            ) {
                obreiroMemberIds.add(member.id);
            }
        }

        const positionsByName = positions
            .map((position) => ({
                positionId: position.id,
                name: position.name,
                category: position.category,
                count: positionCountMap.get(position.id) || 0,
            }))
            .filter((item) => item.count > 0)
            .sort((a, b) => b.count - a.count);

        const positionCategoryBreakdown: Record<string, number> = {
            [ChurchPositionCategory.MINISTERIAL]: ministerialCount,
            [ChurchPositionCategory.OPERATIONAL]: operationalCount,
        };

        const eligibleByRole = new Map<number, Set<number>>();
        const manualByRole = new Map<number, number>();
        const departmentByRole = new Map<number, number>();

        for (const capability of capabilities) {
            const member = capability.member;
            if (!member || !member.isActive || member.deletedAt) continue;

            if (!eligibleByRole.has(capability.serviceRoleId)) {
                eligibleByRole.set(capability.serviceRoleId, new Set());
            }
            eligibleByRole.get(capability.serviceRoleId)!.add(capability.memberId);

            if (capability.source === CapabilitySource.MANUAL) {
                manualByRole.set(
                    capability.serviceRoleId,
                    (manualByRole.get(capability.serviceRoleId) || 0) + 1,
                );
            } else {
                departmentByRole.set(
                    capability.serviceRoleId,
                    (departmentByRole.get(capability.serviceRoleId) || 0) + 1,
                );
            }
        }

        const eligibilitiesByRole = new Map<number, number[]>();
        for (const eligibility of eligibilities) {
            if (!eligibilitiesByRole.has(eligibility.serviceRoleId)) {
                eligibilitiesByRole.set(eligibility.serviceRoleId, []);
            }
            eligibilitiesByRole.get(eligibility.serviceRoleId)!.push(eligibility.departmentId);
        }

        for (const [roleId, departmentIds] of eligibilitiesByRole.entries()) {
            if (!eligibleByRole.has(roleId)) {
                eligibleByRole.set(roleId, new Set());
            }
            const eligibleSet = eligibleByRole.get(roleId)!;
            for (const link of memberDepartments) {
                if (
                    departmentIds.includes(link.departmentId) &&
                    link.member?.isActive &&
                    !link.member.deletedAt
                ) {
                    eligibleSet.add(link.memberId);
                }
            }
        }

        const serviceRolesByCoverage = serviceRoles
            .map((role) => {
                const eligibleCount = eligibleByRole.get(role.id)?.size || 0;
                return {
                    roleId: role.id,
                    name: role.name,
                    eligibleCount,
                    manualCount: manualByRole.get(role.id) || 0,
                    departmentCount: departmentByRole.get(role.id) || 0,
                };
            })
            .sort((a, b) => b.eligibleCount - a.eligibleCount);

        const rolesWithoutCoverage = serviceRolesByCoverage
            .filter((role) => role.eligibleCount === 0)
            .map((role) => ({ roleId: role.roleId, name: role.name }));

        const activeServingGroupIds = new Set(servingGroups.map((group) => group.id));
        const servingGroupMemberCounts = servingGroupMembers.filter((link) =>
            activeServingGroupIds.has(link.servingGroupId),
        );
        const avgServingGroupSize =
            servingGroups.length > 0
                ? Math.round((servingGroupMemberCounts.length / servingGroups.length) * 10) / 10
                : 0;

        const membersInMultipleDepartments = Array.from(memberDepartmentCount.values()).filter(
            (count) => count > 1,
        ).length;

        const withoutPrimaryPositionCount = totalMembers - withPrimaryPositionCount;

        return {
            summary: {
                activeDepartmentsCount: departments.length,
                inactiveDepartmentsCount,
                membersLinkedToDepartmentsCount: linkedMemberIds.size,
                departmentCoveragePercentage:
                    totalMembers > 0
                        ? ((linkedMemberIds.size / totalMembers) * 100).toFixed(1)
                        : '0',
                withPrimaryPositionCount,
                withPrimaryPositionPercentage:
                    totalMembers > 0
                        ? ((withPrimaryPositionCount / totalMembers) * 100).toFixed(1)
                        : '0',
                withoutPrimaryPositionCount,
                ministerialCount,
                operationalCount,
                departmentsWithoutLeaderCount: departmentsWithoutLeader.length,
                obreirosCount: obreiroMemberIds.size,
                servingGroupsCount: servingGroups.length,
                avgServingGroupSize,
                rolesWithoutCoverageCount: rolesWithoutCoverage.length,
                membersInMultipleDepartments,
            },
            membersByDepartment,
            departmentTypeBreakdown,
            departmentRoleBreakdown,
            positionsByName,
            positionCategoryBreakdown,
            departmentsWithoutLeader,
            serviceRolesByCoverage,
            rolesWithoutCoverage,
        };
    }

    private emptyMemberStats() {
        return {
            totalMembers: 0,
            activeMembers: 0,
            inactiveMembers: 0,
            withoutDepartmentCount: 0,
            withPositionCount: 0,
            withoutPositionCount: 0,
            withPositionPercentage: '0',
            baptizedCount: 0,
            baptizedPercentage: '0',
            averageAge: 0,
            newConvertsPercentage: '0',
            newConvertsCount: 0,
            admissionTypes: {},
            genderCounts: {},
            ageCounts: {
                adolescents: 0,
                youngAdults: 0,
                adults: 0,
                seniors: 0,
            },
            tenureCounts: {
                over10: 0,
                between5And10: 0,
                between2And5: 0,
                under2: 0,
            },
            admissionsPerYear: {},
            departuresPerYear: {},
            netGrowthPerYear: {},
        };
    }

    private memberHasCargo(member: Member): boolean {
        return Boolean(member.primaryPositionId || member.secondaryPositionId);
    }

    private getDepartureYear(member: Member): number | null {
        if (member.deletedAt) {
            return member.deletedAt.getFullYear();
        }
        if (!member.isActive && member.updatedAt) {
            return member.updatedAt.getFullYear();
        }
        return null;
    }

    private calculateAge(birthdate: any): number | null {
        if (!birthdate) return null;
        let date = birthdate;
        if (typeof birthdate === 'string') {
            date = this.parseDate(birthdate);
        }
        if (!(date instanceof Date) || isNaN(date.getTime())) return null;

        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
            age--;
        }
        return age;
    }

    private parseDate(dateStr: string | undefined): Date | null {
        if (!dateStr) return null;
        const isoDate = new Date(dateStr);
        if (!isNaN(isoDate.getTime())) return isoDate;

        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const d = new Date(year, month, day);
            if (!isNaN(d.getTime())) return d;
        }
        return null;
    }
}
