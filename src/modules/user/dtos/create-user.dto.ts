import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
    IsOptional,
    IsNumber,
} from 'class-validator';
import { LettersOnly } from '../../../shared/decorators/letters-only.decorator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(15)
    @LettersOnly()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(15)
    @LettersOnly()
    lastName: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsNumber()
    roleId?: number;
}
