import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { DepartmentType } from '../enums/department-type.enum';
import { MemberDepartmentRole } from '../enums/member-department-role.enum';

export class CreateDepartmentDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsEnum(DepartmentType)
    type?: DepartmentType;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    parentId?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}

export class CreateMemberDepartmentDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    memberId: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    departmentId: number;

    @IsOptional()
    @IsEnum(MemberDepartmentRole)
    role?: MemberDepartmentRole;

    @IsOptional()
    @IsDateString()
    startedAt?: string;

    @IsOptional()
    @IsDateString()
    endedAt?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateMemberDepartmentDto extends PartialType(CreateMemberDepartmentDto) {}
