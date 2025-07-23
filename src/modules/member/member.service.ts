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
        const member = this.memberRepository.create({
            ...createMemberDto,
            birthdate: new Date(createMemberDto.birthdate),
            addressId: createMemberDto.addressId,
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
        const updateData: any = {
            ...updateMemberDto,
            updatedBy: userId,
        };
        if (updateMemberDto.birthdate) {
            updateData.birthdate = new Date(updateMemberDto.birthdate);
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
