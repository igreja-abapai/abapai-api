import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { ChurchPositionCategory } from '../enums/church-position-category.enum';

@ValidatorConstraint({ name: 'DistinctPositionIds', async: false })
class DistinctPositionIdsConstraint implements ValidatorConstraintInterface {
    validate(_value: unknown, args: ValidationArguments): boolean {
        const obj = args.object as { primaryPositionId?: number; secondaryPositionId?: number };
        if (!obj.primaryPositionId || !obj.secondaryPositionId) {
            return true;
        }
        return obj.primaryPositionId !== obj.secondaryPositionId;
    }

    defaultMessage(): string {
        return 'Cargo principal e cargo secundário devem ser diferentes';
    }
}

export class CreateChurchPositionDto {
    @IsString()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsEnum(ChurchPositionCategory)
    category?: ChurchPositionCategory;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    sortOrder?: number;
}

export class UpdateChurchPositionDto extends PartialType(CreateChurchPositionDto) {}

export class CreateDepartmentPositionEligibilityDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    departmentId: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    churchPositionId: number;
}

export class UpdateDepartmentPositionEligibilityDto extends PartialType(
    CreateDepartmentPositionEligibilityDto,
) {}

export class UpdateMemberPositionsDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    primaryPositionId?: number | null;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    secondaryPositionId?: number | null;

    @Validate(DistinctPositionIdsConstraint)
    private readonly _distinctPositions?: never;
}
