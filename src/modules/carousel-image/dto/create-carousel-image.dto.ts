import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateCarouselImageDto {
    @IsString()
    @IsNotEmpty()
    imageUrl: string;

    @IsOptional()
    @IsUrl()
    linkUrl?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    position?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
