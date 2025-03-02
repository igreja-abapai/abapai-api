import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePrayerRequestDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    phone: string;

    @IsOptional()
    area: string;

    @IsNotEmpty()
    @IsString()
    request: string;
}
