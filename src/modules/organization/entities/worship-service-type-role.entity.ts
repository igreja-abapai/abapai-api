import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { WorshipServiceType } from './worship-service-type.entity';
import { ServiceRole } from './service-role.entity';

@Entity('worship_service_type_roles')
@Unique(['worshipServiceTypeId', 'serviceRoleId', 'slotNumber'])
export class WorshipServiceTypeRole extends IdTimestampBaseEntity {
    @Column({ name: 'worship_service_type_id' })
    worshipServiceTypeId: number;

    @ManyToOne(() => WorshipServiceType, (type) => type.requiredRoles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'worship_service_type_id' })
    worshipServiceType: WorshipServiceType;

    @Column({ name: 'service_role_id' })
    serviceRoleId: number;

    @ManyToOne(() => ServiceRole, (role) => role.worshipTypeRoles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'service_role_id' })
    serviceRole: ServiceRole;

    @Column({ default: 1 })
    quantity: number;

    @Column({ name: 'slot_number', default: 1 })
    slotNumber: number;

    @Column({ name: 'is_required', default: true })
    isRequired: boolean;

    @Column({ name: 'sort_order', default: 0 })
    sortOrder: number;
}
