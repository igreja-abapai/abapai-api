import { Column, Entity } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';

@Entity()
export class PrayerRequest extends IdTimestampBaseEntity {
    @Column()
    name: string;

    @Column()
    phone: string;

    @Column()
    area: string;

    @Column()
    request: string;
}
