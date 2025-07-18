import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { Address } from '../../address/entities/address.entity';
import { EducationLevel } from './education-level.enum';
import { Gender } from './gender.enum';
import { MaritalStatus } from './marital-status.enum';

@Entity()
export class Member extends IdTimestampBaseEntity {
    @Column()
    name: string;

    @Column({ type: 'enum', enum: Gender })
    gender: Gender;

    @Column({ type: 'date' })
    birthdate: Date;

    @Column()
    nationality: string;

    @Column()
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ type: 'enum', enum: MaritalStatus })
    maritalStatus: MaritalStatus;

    @Column({ nullable: true })
    spouseName: string;

    @Column({ type: 'enum', enum: EducationLevel })
    educationLevel: EducationLevel;

    @Column({ nullable: true })
    addressId: number;

    @OneToOne(() => Address)
    @JoinColumn({ name: 'addressId' })
    address: Address;

    @Column({ nullable: true })
    yearOfConversion: string;

    @Column()
    occupation: string;

    @Column()
    rg: string;

    @Column()
    issuingBody: string;

    @Column()
    cpf: string;

    @Column({ nullable: true })
    lastChurch: string;

    @Column({ nullable: true })
    lastPositionHeld: string;

    @Column()
    isBaptized: boolean;

    @Column({ nullable: true })
    isBaptizedInTheHolySpirit: boolean;

    @Column({ nullable: true })
    currentPosition: string;

    @Column({ nullable: true })
    wantsToBeAVolunteer: boolean;

    @Column({ nullable: true })
    areaOfInterest: string;
}
