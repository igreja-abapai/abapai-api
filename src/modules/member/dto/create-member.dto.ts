import {
    IsBoolean,
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateIf,
} from 'class-validator';
import { Gender } from '../entities/gender.enum';
import { MaritalStatus } from '../entities/marital-status.enum';
import { EducationLevel } from '../entities/education-level.enum';
import { AdmissionType } from '../entities/admission-type.enum';

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
    @ValidateIf((o) => o.email !== undefined && o.email !== null && o.email !== '')
    @IsEmail({}, { message: 'Email deve ter um formato válido' })
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

    @IsOptional()
    @IsString()
    yearOfBaptism: string;

    @IsOptional()
    @IsString()
    placeOfBirth: string;

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

    @IsOptional()
    @IsNumber()
    childrenCount: number;

    @IsOptional()
    @IsString()
    fatherName: string;

    @IsOptional()
    @IsString()
    motherName: string;

    @IsOptional()
    @IsString()
    lastPositionPeriod: string;

    @IsOptional()
    @IsString()
    baptismPlace: string;

    @IsOptional()
    @IsString()
    observations: string;

    @IsOptional()
    @IsDateString()
    admissionDate: string;

    @IsOptional()
    @IsEnum(AdmissionType)
    admissionType: AdmissionType;
}
