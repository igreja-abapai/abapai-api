import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { AssignmentStatus } from '../enums/assignment-status.enum';
import { WorshipService } from './worship-service.entity';
import { ServiceRole } from './service-role.entity';
import { Member } from '../../member/entities/member.entity';
import { ServingGroup } from './serving-group.entity';

@Entity('service_assignments')
export class ServiceAssignment extends IdTimestampBaseEntity {
    @Column({ name: 'worship_service_id' })
    worshipServiceId: number;

    @ManyToOne(() => WorshipService, (service) => service.assignments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'worship_service_id' })
    worshipService: WorshipService;

    @Column({ name: 'service_role_id' })
    serviceRoleId: number;

    @ManyToOne(() => ServiceRole, (role) => role.assignments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'service_role_id' })
    serviceRole: ServiceRole;

    @Column({ name: 'slot_number', default: 1 })
    slotNumber: number;

    @Column({ name: 'member_id', nullable: true })
    memberId: number;

    @ManyToOne(() => Member, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'member_id' })
    member: Member;

    @Column({ name: 'serving_group_id', nullable: true })
    servingGroupId: number;

    @ManyToOne(() => ServingGroup, (group) => group.assignments, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'serving_group_id' })
    servingGroup: ServingGroup;

    @Column({ type: 'enum', enum: AssignmentStatus, default: AssignmentStatus.EMPTY })
    status: AssignmentStatus;

    @Column({ name: 'assigned_by', nullable: true })
    assignedBy: number;

    @Column({ name: 'assigned_at', type: 'timestamp', nullable: true })
    assignedAt: Date;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ name: 'guest_name', type: 'varchar', length: 255, nullable: true })
    guestName: string;
}
