import { Column, Entity, OneToMany } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { Weekday } from '../enums/weekday.enum';
import { WorshipServiceTypeRole } from './worship-service-type-role.entity';
import { WorshipService } from './worship-service.entity';

@Entity('worship_service_types')
export class WorshipServiceType extends IdTimestampBaseEntity {
    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'default_weekday', type: 'enum', enum: Weekday, nullable: true })
    defaultWeekday: Weekday;

    @Column({ name: 'default_time', type: 'varchar', length: 5, nullable: true })
    defaultTime: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @OneToMany(() => WorshipServiceTypeRole, (typeRole) => typeRole.worshipServiceType)
    requiredRoles: WorshipServiceTypeRole[];

    @OneToMany(() => WorshipService, (service) => service.worshipServiceType)
    worshipServices: WorshipService[];
}
