import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PaginationQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    sortBy?: string = 'name';

    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC', 'asc', 'desc'])
    sortOrder?: 'ASC' | 'DESC' = 'ASC';

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Boolean)
    isBaptized?: boolean;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === undefined || value === null) return true;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    })
    isPaginated?: boolean = true;
}
