import {
    IsBoolean,
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { Gender } from '../entities/gender.enum';
import { MaritalStatus } from '../entities/marital-status.enum';
import { EducationLevel } from '../entities/education-level.enum';

export class CreateMemberDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEnum(Gender)
    gender: Gender;

    @IsNotEmpty()
    @IsDateString()
    birthdate: string;

    @IsNotEmpty()
    @IsString()
    nationality: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsOptional()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsEnum(MaritalStatus)
    maritalStatus: MaritalStatus;

    @IsOptional()
    @IsString()
    spouseName: string;

    @IsNotEmpty()
    @IsEnum(EducationLevel)
    educationLevel: EducationLevel;

    @IsNumber()
    addressId: number;

    @IsOptional()
    @IsString()
    yearOfConversion: string;

    @IsNotEmpty()
    @IsString()
    occupation: string;

    @IsNotEmpty()
    @IsString()
    rg: string;

    @IsNotEmpty()
    @IsString()
    issuingBody: string;

    @IsNotEmpty()
    @IsString()
    cpf: string;

    @IsOptional()
    @IsString()
    lastChurch: string;

    @IsOptional()
    @IsString()
    lastPositionHeld: string;

    @IsNotEmpty()
    @IsBoolean()
    isBaptized: boolean;

    @IsOptional()
    @IsBoolean()
    isBaptizedInTheHolySpirit: boolean;

    @IsOptional()
    @IsString()
    currentPosition: string;

    @IsOptional()
    @IsBoolean()
    wantsToBeAVolunteer: boolean;

    @IsOptional()
    @IsString()
    areaOfInterest: string;

    @IsOptional()
    @IsString()
    photoUrl: string;
}
