import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateServingGroupDto {
    @IsString()
    @MaxLength(255)
    name: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    serviceRoleId: number;

    @IsArray()
    @ArrayMinSize(1)
    @Type(() => Number)
    @IsInt({ each: true })
    @Min(1, { each: true })
    memberIds: number[];

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateServingGroupDto extends PartialType(CreateServingGroupDto) {}

export class CreateServingGroupMemberDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    servingGroupId: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    memberId: number;
}

export class UpdateServingGroupMemberDto extends PartialType(CreateServingGroupMemberDto) {}
