import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';
import { ServiceRoleCategory } from '../enums/service-role-category.enum';
import { CapabilitySource } from '../enums/capability-source.enum';

export class CreateServiceRoleDto {
    @IsString()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsEnum(ServiceRoleCategory)
    category?: ServiceRoleCategory;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateServiceRoleDto extends PartialType(CreateServiceRoleDto) {}

export class CreateMemberServiceCapabilityDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    memberId: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    serviceRoleId: number;

    @IsOptional()
    @IsEnum(CapabilitySource)
    source?: CapabilitySource;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsDateString()
    validFrom?: string;

    @IsOptional()
    @IsDateString()
    validTo?: string;
}

export class UpdateMemberServiceCapabilityDto extends PartialType(
    CreateMemberServiceCapabilityDto,
) {}

export class CreateDepartmentRoleEligibilityDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    departmentId: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    serviceRoleId: number;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}

export class UpdateDepartmentRoleEligibilityDto extends PartialType(
    CreateDepartmentRoleEligibilityDto,
) {}
