import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateAssetAttachmentDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    fileName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    fileUrl: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    mimeType?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    fileSize?: number;
}
