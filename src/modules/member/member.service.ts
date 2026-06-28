import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, IsNull, Repository } from 'typeorm';
import { buildWordStartPattern } from '../../shared/utils/word-search.utils';
import {
    SEARCH_ACCENT_FROM,
    SEARCH_ACCENT_TO,
    translateSqlExpression,
} from '../../shared/utils/search-text.utils';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member } from './entities/member.entity';

@Injectable()
export class MemberService {
    constructor(
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
    ) {}

    async create(createMemberDto: CreateMemberDto, userId: number): Promise<Member> {
        const processedData = { ...createMemberDto };

        if (processedData.childrenCount === null || processedData.childrenCount === undefined) {
            processedData.childrenCount = undefined;
        }

        if (processedData.admissionType === null || processedData.admissionType === undefined) {
            processedData.admissionType = undefined;
        }

        const member = this.memberRepository.create({
            ...processedData,
            birthdate: new Date(processedData.birthdate),
            addressId: processedData.addressId,
            createdBy: userId,
        });
        return await this.memberRepository.save(member);
    }

    async findAll(query?: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'ASC' | 'DESC';
        search?: string;
        isBaptized?: boolean;
        isActive?: boolean;
        deletedOnly?: boolean;
        isPaginated?: boolean;
        withPrimaryPosition?: boolean;
        incompleteProfile?: boolean;
    }): Promise<{
        data: Member[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        // Handle isPaginated - can be boolean, string 'true'/'false', or undefined
        let isPaginated = true; // Default to true
        if (query?.isPaginated !== undefined) {
            if (typeof query.isPaginated === 'boolean') {
                isPaginated = query.isPaginated;
            } else if (typeof query.isPaginated === 'string') {
                isPaginated = query.isPaginated === 'true';
            }
        }

        const page = query?.page || 1;
        const limit = query?.limit || 10;
        const skip = isPaginated ? (page - 1) * limit : 0;
        const sortBy = query?.sortBy || 'name';
        const sortOrder = query?.sortOrder || 'ASC';

        // Build query builder
        const queryBuilder = this.memberRepository
            .createQueryBuilder('member')
            .leftJoinAndSelect('member.address', 'address')
            .leftJoinAndSelect('member.primaryPosition', 'primaryPosition')
            .leftJoinAndSelect('member.secondaryPosition', 'secondaryPosition');

        if (query?.deletedOnly) {
            queryBuilder.where('member.deletedAt IS NOT NULL');
        } else {
            queryBuilder.where('member.deletedAt IS NULL');
        }

        // Apply search filter — match only when a word starts with the search term
        if (query?.search) {
            const term = query.search.trim();
            const namePattern = buildWordStartPattern(term, '[[:space:]]');
            const emailPattern = buildWordStartPattern(term, '[[:space:]@._-]');
            const phoneDigits = term.replace(/\D/g, '');

            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where(`${translateSqlExpression('member.name')} ~* :namePattern`, {
                        namePattern,
                    }).orWhere(`${translateSqlExpression('member.email')} ~* :emailPattern`, {
                        emailPattern,
                    });

                    if (phoneDigits) {
                        qb.orWhere(
                            "regexp_replace(member.phone, '\\D', '', 'g') LIKE :phonePrefix",
                            { phonePrefix: `${phoneDigits}%` },
                        );
                    }

                    qb.orWhere(
                        `${translateSqlExpression('primaryPosition.name')} ~* :namePattern`,
                        { namePattern },
                    ).orWhere(
                        `${translateSqlExpression('secondaryPosition.name')} ~* :namePattern`,
                        { namePattern },
                    );
                }),
            );
        }

        // Apply baptism filter
        if (query?.isBaptized !== undefined) {
            queryBuilder.andWhere('member.isBaptized = :isBaptized', {
                isBaptized: query.isBaptized,
            });
        }

        // Apply status filter
        if (query?.isActive !== undefined) {
            queryBuilder.andWhere('member.isActive = :isActive', {
                isActive: query.isActive,
            });
        }

        if (query?.withPrimaryPosition) {
            queryBuilder.andWhere('member.primaryPositionId IS NOT NULL');
        }

        if (query?.incompleteProfile) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where("member.cpf IS NULL OR TRIM(member.cpf) = ''")
                        .orWhere("member.phone IS NULL OR TRIM(member.phone) = ''")
                        .orWhere('member.birthdate IS NULL')
                        .orWhere(
                            "member.yearOfConversion IS NULL OR TRIM(member.yearOfConversion) = ''",
                        )
                        .orWhere("member.admissionDate IS NULL OR TRIM(member.admissionDate) = ''")
                        .orWhere(
                            "(member.isBaptized = true AND (member.yearOfBaptism IS NULL OR TRIM(member.yearOfBaptism) = ''))",
                        )
                        .orWhere("address.streetName IS NULL OR TRIM(address.streetName) = ''");
                }),
            );
        }

        // Apply sorting with accent-insensitive comparison
        // Boolean and numeric columns don't need accent normalization
        const booleanColumns = [
            'isBaptized',
            'isBaptizedInTheHolySpirit',
            'wantsToBeAVolunteer',
            'isActive',
        ];
        const numericColumns = ['id', 'childrenCount', 'addressId', 'createdBy', 'updatedBy'];
        const dateColumns = ['birthdate', 'createdAt', 'updatedAt', 'deletedAt'];

        const needsAccentNormalization =
            !booleanColumns.includes(sortBy) &&
            !numericColumns.includes(sortBy) &&
            !dateColumns.includes(sortBy);

        if (needsAccentNormalization) {
            const sortAlias = 'normalized_sort';
            if (sortBy === 'address') {
                queryBuilder.addSelect(
                    `LOWER(TRANSLATE(address.streetName, '${SEARCH_ACCENT_FROM}', '${SEARCH_ACCENT_TO}'))`,
                    sortAlias,
                );
            } else {
                // Sanitize column name to prevent SQL injection
                const columnName = sortBy.replace(/[^a-zA-Z0-9_]/g, '');
                queryBuilder.addSelect(
                    `LOWER(TRANSLATE(member."${columnName}", '${SEARCH_ACCENT_FROM}', '${SEARCH_ACCENT_TO}'))`,
                    sortAlias,
                );
            }

            queryBuilder.orderBy(sortAlias, sortOrder);
        } else {
            // For boolean, numeric, and date columns, use direct ordering
            if (sortBy === 'address') {
                queryBuilder.orderBy('address.streetName', sortOrder);
            } else {
                queryBuilder.orderBy(`member.${sortBy}`, sortOrder);
            }
        }

        // When using addSelect for sorting, we must use getRawAndEntities even when not paginated
        // to get the computed sort field, but we'll ignore pagination limits

        // Get total count
        const total = await queryBuilder.getCount();

        // Apply pagination only if isPaginated is true
        if (isPaginated) {
            queryBuilder.skip(skip).take(limit);
        }
        // When not paginated, don't call skip() or take() - will return all results

        // Always use getRawAndEntities when we have computed sort fields (addSelect)
        // or when paginated. When not paginated and no computed fields, getMany() works fine
        const hasComputedSort = needsAccentNormalization;

        // When not paginated, ensure we don't have any limits applied
        if (!isPaginated) {
            // Execute query without pagination
            const allData = hasComputedSort
                ? (await queryBuilder.getRawAndEntities()).entities
                : await queryBuilder.getMany();
            return {
                data: allData,
                total,
                page: 1,
                limit: total,
                totalPages: 1,
            };
        }

        // Paginated path
        const { entities } = await queryBuilder.getRawAndEntities();
        const data = entities;

        const totalPages = isPaginated ? Math.ceil(total / limit) : 1;

        return {
            data,
            total,
            page: isPaginated ? page : 1,
            limit: isPaginated ? limit : total,
            totalPages,
        };
    }

    async findOne(id: number): Promise<Member> {
        return await this.memberRepository.findOne({
            where: { id, deletedAt: IsNull() },
            relations: ['address', 'primaryPosition', 'secondaryPosition'],
        });
    }

    async update(id: number, updateMemberDto: UpdateMemberDto, userId: number): Promise<Member> {
        // Preprocess the data to handle empty strings for numeric fields
        const processedData = { ...updateMemberDto };

        // Convert empty strings to undefined for numeric fields
        if (processedData.childrenCount === null || processedData.childrenCount === undefined) {
            processedData.childrenCount = undefined;
        }

        // Convert empty strings to undefined for enum fields
        if (processedData.admissionType === null || processedData.admissionType === undefined) {
            processedData.admissionType = undefined;
        }

        if (processedData.isActive === false) {
            const reason = processedData.absenceReason?.trim();
            processedData.absenceReason = reason || null;
        }

        if (processedData.isActive === true) {
            processedData.absenceReason = null;
        }

        const updateData: any = {
            ...processedData,
            updatedBy: userId,
        };
        if (updateData.birthdate) {
            updateData.birthdate = new Date(updateData.birthdate);
        }

        await this.memberRepository.update(id, updateData);
        return await this.findOne(id);
    }

    async remove(id: number, userId: number): Promise<void> {
        await this.memberRepository.update(id, {
            deletedAt: new Date(),
            updatedBy: userId,
        });
    }

    async restore(id: number, userId: number): Promise<Member> {
        await this.memberRepository.update(id, {
            deletedAt: null,
            isActive: true,
            updatedBy: userId,
        });
        return await this.findOne(id);
    }

    async findMembersWithBirthdayToday(month: number, day: number): Promise<Member[]> {
        return await this.memberRepository
            .createQueryBuilder('member')
            .where('EXTRACT(MONTH FROM member.birthdate) = :month', { month })
            .andWhere('EXTRACT(DAY FROM member.birthdate) = :day', { day })
            .andWhere('member.deletedAt IS NULL')
            .getMany();
    }
}
