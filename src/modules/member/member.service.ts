import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    }): Promise<{
        data: Member[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const page = query?.page || 1;
        const limit = query?.limit || 10;
        const skip = (page - 1) * limit;
        const sortBy = query?.sortBy || 'name';
        const sortOrder = query?.sortOrder || 'ASC';

        // Build query builder
        const queryBuilder = this.memberRepository
            .createQueryBuilder('member')
            .leftJoinAndSelect('member.address', 'address');

        // Apply search filter
        if (query?.search) {
            queryBuilder.where(
                '(member.name ILIKE :search OR member.email ILIKE :search OR member.phone ILIKE :search)',
                { search: `%${query.search}%` },
            );
        }

        // Apply baptism filter
        if (query?.isBaptized !== undefined) {
            if (query?.search) {
                queryBuilder.andWhere('member.isBaptized = :isBaptized', {
                    isBaptized: query.isBaptized,
                });
            } else {
                queryBuilder.where('member.isBaptized = :isBaptized', {
                    isBaptized: query.isBaptized,
                });
            }
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
        const dateColumns = ['birthdate', 'createdAt', 'updatedAt'];

        const needsAccentNormalization =
            !booleanColumns.includes(sortBy) &&
            !numericColumns.includes(sortBy) &&
            !dateColumns.includes(sortBy);

        if (needsAccentNormalization) {
            // Use PostgreSQL's TRANSLATE() to normalize accented characters for text columns
            const accentFrom = 'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ';
            const accentTo = 'aaaaaeeeeiiiioooouuuucAAAAAEEEEIIIIOOOOUUUUC';

            const sortAlias = 'normalized_sort';
            if (sortBy === 'address') {
                queryBuilder.addSelect(
                    `LOWER(TRANSLATE(address.streetName, '${accentFrom}', '${accentTo}'))`,
                    sortAlias,
                );
            } else {
                // Sanitize column name to prevent SQL injection
                const columnName = sortBy.replace(/[^a-zA-Z0-9_]/g, '');
                queryBuilder.addSelect(
                    `LOWER(TRANSLATE(member."${columnName}", '${accentFrom}', '${accentTo}'))`,
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

        const total = await queryBuilder.getCount();

        queryBuilder.skip(skip).take(limit);

        const { entities } = await queryBuilder.getRawAndEntities();
        const data = entities;

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findOne(id: number): Promise<Member> {
        return await this.memberRepository.findOne({
            where: { id },
            relations: ['address'],
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

    async remove(id: number): Promise<void> {
        await this.memberRepository.delete(id);
    }

    async findMembersWithBirthdayToday(month: number, day: number): Promise<Member[]> {
        return await this.memberRepository
            .createQueryBuilder('member')
            .where('EXTRACT(MONTH FROM member.birthdate) = :month', { month })
            .andWhere('EXTRACT(DAY FROM member.birthdate) = :day', { day })
            .getMany();
    }
}
