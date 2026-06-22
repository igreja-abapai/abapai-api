import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { WorshipServiceStatus } from '../enums/worship-service-status.enum';
import { WorshipServiceType } from './worship-service-type.entity';
import { ServiceAssignment } from './service-assignment.entity';

@Entity('worship_services')
export class WorshipService extends IdTimestampBaseEntity {
    @Column({ name: 'worship_service_type_id', nullable: true })
    worshipServiceTypeId: number;

    @ManyToOne(() => WorshipServiceType, (type) => type.worshipServices, { nullable: true })
    @JoinColumn({ name: 'worship_service_type_id' })
    worshipServiceType: WorshipServiceType;

    @Column({ name: 'scheduled_at', type: 'timestamp' })
    /** Stored as UTC wall-clock in a timestamp-without-tz column; API runs with TZ=UTC. */
    scheduledAt: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ type: 'enum', enum: WorshipServiceStatus, default: WorshipServiceStatus.DRAFT })
    status: WorshipServiceStatus;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ name: 'published_by', nullable: true })
    publishedBy: number;

    @Column({ name: 'published_at', type: 'timestamp', nullable: true })
    publishedAt: Date;

    @OneToMany(() => ServiceAssignment, (assignment) => assignment.worshipService)
    assignments: ServiceAssignment[];
}
