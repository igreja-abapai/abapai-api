import { Column, Entity } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';

@Entity()
export class PrayerRequest extends IdTimestampBaseEntity {
    @Column({ default: 'Anônimo' })
    name: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    area: string;

    @Column()
    request: string;
}
