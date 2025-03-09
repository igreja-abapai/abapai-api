import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsString()
    country: string;

    @IsNotEmpty()
    @IsString()
    district: string;

    @IsOptional()
    @IsString()
    postalCode: string;

    @IsNotEmpty()
    @IsString()
    streetName: string;

    @IsNotEmpty()
    @IsString()
    streetNumber: string;

    @IsNotEmpty()
    @IsString()
    state: string;
}
