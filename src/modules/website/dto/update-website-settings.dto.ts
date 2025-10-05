import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateWebsiteSettingsDto {
    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    facebook?: string;

    @IsOptional()
    @IsString()
    instagram?: string;

    @IsOptional()
    @IsString()
    youtube?: string;

    @IsOptional()
    @IsString()
    twitter?: string;

    @IsOptional()
    @IsString()
    about?: string;

    @IsOptional()
    @IsString()
    serviceTimes?: string;

    @IsOptional()
    @IsString()
    aboutWhoWeAre?: string;

    @IsOptional()
    @IsString()
    aboutOurMission?: string;

    @IsOptional()
    @IsString()
    aboutOurValues?: string;

    @IsOptional()
    @IsString()
    weeklyMessageUrl?: string;

    @IsOptional()
    @IsString()
    weeklyMessageTitle?: string;

    @IsOptional()
    @IsString()
    weeklyMessageDate?: string;

    @IsOptional()
    @IsBoolean()
    maintenanceMode?: boolean;
}
