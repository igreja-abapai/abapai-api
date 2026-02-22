import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../member/entities/member.entity';

@Injectable()
export class StatsService {
    constructor(
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
    ) {}

    async getMemberStats() {
        // Fetch all active members
        const members = await this.memberRepository.find({
            where: { isActive: true },
        });

        const now = new Date();
        const currentYear = now.getFullYear();

        const totalMembers = members.length;
        if (totalMembers === 0) {
            return {
                totalMembers: 0,
                baptizedCount: 0,
                baptizedPercentage: '0',
                averageAge: 0,
                newConvertsPercentage: '0',
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
            };
        }

        let baptizedCount = 0;
        let totalAge = 0;
        let ageCount = 0;
        let newConverts = 0;

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

        members.forEach((m) => {
            // Baptized
            if (m.isBaptized) baptizedCount++;

            // Age
            if (m.birthdate) {
                const age = this.calculateAge(m.birthdate);
                if (age !== null) {
                    totalAge += age;
                    ageCount++;

                    // Age Groups
                    if (age >= 13 && age <= 17) ageCounts.adolescents++;
                    else if (age >= 18 && age <= 29) ageCounts.youngAdults++;
                    else if (age >= 30 && age <= 59) ageCounts.adults++;
                    else if (age >= 60) ageCounts.seniors++;
                }
            }

            // New Converts
            if (m.yearOfConversion) {
                const year = parseInt(m.yearOfConversion, 10);
                if (!isNaN(year) && currentYear - year <= 1) {
                    newConverts++;
                }
            }

            // Admission Types
            const type = m.admissionType || 'Não informado';
            admissionTypes[type] = (admissionTypes[type] || 0) + 1;

            // Gender
            if (m.gender) {
                genderCounts[m.gender] = (genderCounts[m.gender] || 0) + 1;
            }

            // Admission & Tenure
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
        });

        return {
            totalMembers,
            baptizedCount,
            baptizedPercentage: ((baptizedCount / totalMembers) * 100).toFixed(1),
            averageAge: ageCount > 0 ? Math.round(totalAge / ageCount) : 0,
            newConvertsPercentage: ((newConverts / totalMembers) * 100).toFixed(1),
            admissionTypes,
            genderCounts,
            ageCounts,
            tenureCounts,
            admissionsPerYear,
        };
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
