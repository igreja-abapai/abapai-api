import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsDateString,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FinancialTransactionType } from '../entities/financial-transaction-type.enum';

export class CreateTransactionDto {
    @IsDateString()
    date: string;

    @IsEnum(FinancialTransactionType)
    type: FinancialTransactionType;

    @IsString()
    @IsNotEmpty()
    category: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    amount: number;

    @IsOptional()
    @IsString()
    description?: string;
}
