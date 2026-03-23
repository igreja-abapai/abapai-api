import { IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SummaryQueryDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    month: number;

    @Type(() => Number)
    @IsInt()
    @Min(2000)
    @Max(2100)
    year: number;
}
