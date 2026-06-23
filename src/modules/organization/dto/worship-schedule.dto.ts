import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import {
    ArrayUnique,
    IsBoolean,
    IsInt,
    IsArray,
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
    Matches,
    Max,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';
import { Weekday } from '../enums/weekday.enum';

export class CreateWorshipServiceTypeDto {
    @IsString()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(Weekday)
    defaultWeekday?: Weekday;

    @IsOptional()
    @Matches(/^\d{2}:\d{2}$/)
    defaultTime?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateWorshipServiceTypeDto extends PartialType(CreateWorshipServiceTypeDto) {}

export class CreateWorshipServiceTypeRoleDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    worshipServiceTypeId: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    serviceRoleId: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(20)
    quantity?: number;

    @IsOptional()
    @IsBoolean()
    isRequired?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    sortOrder?: number;
}

export class UpdateWorshipServiceTypeRoleDto {
    @IsOptional()
    @IsBoolean()
    isRequired?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    sortOrder?: number;
}

export class CreateWorshipServiceDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    worshipServiceTypeId?: number;

    @IsDateString()
    scheduledAt: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateWorshipServiceDto extends PartialType(CreateWorshipServiceDto) {}

export class CreateWorshipServiceFromTemplateDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    worshipServiceTypeId: number;

    @IsDateString()
    scheduledAt: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsBoolean()
    asDraft?: boolean;
}

export class CreateWorshipServicesFromTemplateByWeekdayDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    worshipServiceTypeId: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(52)
    count: number;

    @IsOptional()
    @IsEnum(Weekday)
    weekday?: Weekday;

    @IsOptional()
    @IsDateString()
    startFrom?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsBoolean()
    asDraft?: boolean;
}

export class GenerateWorshipServicesMonthDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    month: number;

    @Type(() => Number)
    @IsInt()
    @Min(1900)
    year: number;

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @Type(() => Number)
    @IsInt({ each: true })
    @Min(1, { each: true })
    autoAssignRoleIds?: number[];

    @IsOptional()
    @IsBoolean()
    proceedWithWarnings?: boolean;

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @Type(() => Number)
    @IsInt({ each: true })
    @Min(1, { each: true })
    excludedMemberIds?: number[];
}

export class GenerateWorshipAssignmentsMonthDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    month: number;

    @Type(() => Number)
    @IsInt()
    @Min(1900)
    year: number;

    @IsArray()
    @ArrayUnique()
    @Type(() => Number)
    @IsInt({ each: true })
    @Min(1, { each: true })
    autoAssignRoleIds: number[];

    @IsOptional()
    @IsBoolean()
    proceedWithWarnings?: boolean;

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @Type(() => Number)
    @IsInt({ each: true })
    @Min(1, { each: true })
    excludedMemberIds?: number[];
}

export class AssignServiceAssignmentDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    assignmentId: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    memberId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    servingGroupId?: number;

    @IsOptional()
    @ValidateIf((_, value) => value !== null)
    @IsString()
    @MaxLength(255)
    guestName?: string | null;

    @IsOptional()
    @ValidateIf((_, value) => value !== null)
    @Type(() => Number)
    @IsInt()
    @Min(1)
    preacherId?: number | null;

    @IsOptional()
    @ValidateIf((_, value) => value !== null)
    @IsString()
    notes?: string | null;
}

export class CopyWorshipServiceAssignmentsDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    sourceWorshipServiceId: number;
}
