import { Column, Entity } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';

@Entity()
export class Address extends IdTimestampBaseEntity {
    @Column()
    city: string;

    @Column()
    country: string;

    @Column()
    district: string;

    @Column({ nullable: true })
    postalCode: string;

    @Column()
    streetName: string;

    @Column()
    streetNumber: string;

    @Column()
    state: string;
}
