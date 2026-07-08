import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpsertMemberDiscipleshipDto {
    @IsBoolean()
    needsDiscipleship: boolean;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
