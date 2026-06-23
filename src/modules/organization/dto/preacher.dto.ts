import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePreacherDto {
    @IsString()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    phone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    photoUrl?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdatePreacherDto extends PartialType(CreatePreacherDto) {}
