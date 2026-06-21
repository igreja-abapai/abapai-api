import { Type } from 'class-transformer';
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';
import { AssetConservationState } from '../enums/asset-conservation-state.enum';
import { AssetDisposalReason } from '../enums/asset-disposal-reason.enum';
import { AssetOrigin } from '../enums/asset-origin.enum';
import { AssetStatus } from '../enums/asset-status.enum';

export class CreateAssetDto {
    @IsString()
    @IsNotEmpty()
    description: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    categoryId: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    locationId: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    departmentId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    responsibleMemberId?: number;

    @IsOptional()
    @IsString()
    responsibleName?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    quantity?: number;

    @IsOptional()
    @IsDateString()
    acquisitionDate?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    acquisitionValue?: number;

    @IsOptional()
    @IsEnum(AssetOrigin)
    origin?: AssetOrigin;

    @IsOptional()
    @IsString()
    supplierOrDonor?: string;

    @IsOptional()
    @IsString()
    invoiceNumber?: string;

    @IsOptional()
    @IsEnum(AssetStatus)
    status?: AssetStatus;

    @IsOptional()
    @IsEnum(AssetConservationState)
    conservationState?: AssetConservationState;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    photoUrl?: string | null;
}

export class UpdateAssetDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    categoryId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    locationId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    departmentId?: number | null;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    responsibleMemberId?: number | null;

    @IsOptional()
    @IsString()
    responsibleName?: string | null;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    quantity?: number;

    @IsOptional()
    @IsDateString()
    acquisitionDate?: string | null;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    acquisitionValue?: number | null;

    @IsOptional()
    @IsEnum(AssetOrigin)
    origin?: AssetOrigin | null;

    @IsOptional()
    @IsString()
    supplierOrDonor?: string | null;

    @IsOptional()
    @IsString()
    invoiceNumber?: string | null;

    @IsOptional()
    @IsEnum(AssetStatus)
    status?: AssetStatus;

    @IsOptional()
    @IsEnum(AssetConservationState)
    conservationState?: AssetConservationState | null;

    @IsOptional()
    @IsString()
    notes?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    photoUrl?: string | null;
}

export class DisposeAssetDto {
    @IsDateString()
    disposedAt: string;

    @IsEnum(AssetDisposalReason)
    disposalReason: AssetDisposalReason;

    @IsOptional()
    @IsString()
    disposalNotes?: string;
}
