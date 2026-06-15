import {
    IsBoolean,
    IsDateString,
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    Validate,
    ValidateIf,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../entities/gender.enum';
import { MaritalStatus } from '../entities/marital-status.enum';
import { EducationLevel } from '../entities/education-level.enum';
import { AdmissionType } from '../entities/admission-type.enum';

@ValidatorConstraint({ name: 'DistinctMemberPositionIds', async: false })
class DistinctMemberPositionIdsConstraint implements ValidatorConstraintInterface {
    validate(_value: unknown, args: ValidationArguments): boolean {
        const obj = args.object as { primaryPositionId?: number; secondaryPositionId?: number };
        if (!obj.primaryPositionId || !obj.secondaryPositionId) {
            return true;
        }
        return obj.primaryPositionId !== obj.secondaryPositionId;
    }

    defaultMessage(): string {
        return 'Cargo principal e cargo secundário devem ser diferentes';
    }
}

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
    @ValidateIf(
        (o) => o.isBaptizedInTheHolySpirit !== undefined && o.isBaptizedInTheHolySpirit !== null,
    )
    @IsBoolean()
    isBaptizedInTheHolySpirit: boolean;

    @IsOptional()
    @IsString()
    currentPosition: string;

    @IsOptional()
    @ValidateIf(
        (o) =>
            o.primaryPositionId !== null &&
            o.primaryPositionId !== undefined &&
            o.primaryPositionId !== '',
    )
    @Type(() => Number)
    @IsInt()
    @Min(1)
    primaryPositionId?: number | null;

    @IsOptional()
    @ValidateIf(
        (o) =>
            o.secondaryPositionId !== null &&
            o.secondaryPositionId !== undefined &&
            o.secondaryPositionId !== '',
    )
    @Type(() => Number)
    @IsInt()
    @Min(1)
    secondaryPositionId?: number | null;

    @Validate(DistinctMemberPositionIdsConstraint)
    private readonly _distinctPositions?: never;

    @IsOptional()
    @ValidateIf((o) => o.wantsToBeAVolunteer !== undefined && o.wantsToBeAVolunteer !== null)
    @IsBoolean()
    wantsToBeAVolunteer: boolean;

    @IsOptional()
    @IsString()
    areaOfInterest: string;

    @IsOptional()
    @IsString()
    photoUrl: string;

    @IsOptional()
    @ValidateIf(
        (o) => o.childrenCount !== undefined && o.childrenCount !== null && o.childrenCount !== '',
    )
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
    @IsString()
    admissionDate: string;

    @IsOptional()
    @ValidateIf(
        (o) => o.admissionType !== undefined && o.admissionType !== null && o.admissionType !== '',
    )
    @IsEnum(AdmissionType)
    admissionType: AdmissionType;
    @IsOptional()
    @IsBoolean()
    isActive: boolean;

    @IsOptional()
    @IsString()
    absenceReason: string;
}
