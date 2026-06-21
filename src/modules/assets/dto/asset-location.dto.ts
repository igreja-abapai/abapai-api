import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssetLocationDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateAssetLocationDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
