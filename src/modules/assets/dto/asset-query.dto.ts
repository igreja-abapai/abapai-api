import { Type, Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { AssetConservationState } from '../enums/asset-conservation-state.enum';
import { AssetOrigin } from '../enums/asset-origin.enum';
import { AssetStatus } from '../enums/asset-status.enum';

export class AssetQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    categoryId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    locationId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    departmentId?: number;

    @IsOptional()
    @IsEnum(AssetStatus)
    status?: AssetStatus;

    @IsOptional()
    @IsEnum(AssetConservationState)
    conservationState?: AssetConservationState;

    @IsOptional()
    @IsEnum(AssetOrigin)
    origin?: AssetOrigin;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === undefined || value === null) return false;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value.toLowerCase() === 'true';
        return Boolean(value);
    })
    @IsBoolean()
    includeDisposed?: boolean;
}
