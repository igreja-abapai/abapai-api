import { Column, Entity, OneToMany } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { ServiceAssignment } from './service-assignment.entity';

@Entity('preachers')
export class Preacher extends IdTimestampBaseEntity {
    @Column()
    name: string;

    @Column({ type: 'varchar', length: 30, nullable: true })
    phone: string;

    @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
    photoUrl: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @OneToMany(() => ServiceAssignment, (assignment) => assignment.preacher)
    assignments: ServiceAssignment[];
}
