import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateScheduleEventDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    time: string;

    @IsString()
    days: string[];

    @IsOptional()
    @IsInt()
    @Min(0)
    position?: number;
}
