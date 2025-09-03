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

    async findAll(): Promise<Member[]> {
        return await this.memberRepository.find({
            relations: ['address'],
        });
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
