import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MemberDiscipleshipCaseStatus } from '../entities/member-discipleship-case-status.enum';

export class UpdateMemberDiscipleshipCaseDto {
    @IsEnum(MemberDiscipleshipCaseStatus)
    status: MemberDiscipleshipCaseStatus;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
