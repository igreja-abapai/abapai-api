import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssetCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateAssetCategoryDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
