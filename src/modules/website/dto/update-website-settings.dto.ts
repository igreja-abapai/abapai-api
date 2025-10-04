import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateWebsiteSettingsDto {
    @IsOptional()
    @IsString()
    churchName?: string;

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
    about?: string;

    @IsOptional()
    @IsString()
    serviceTimes?: string;

    @IsOptional()
    @IsString()
    welcomeMessage?: string;

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
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    maintenanceMode?: boolean;
}
