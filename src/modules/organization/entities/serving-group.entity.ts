import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { ServingGroupMember } from './serving-group-member.entity';
import { ServiceAssignment } from './service-assignment.entity';
import { ServiceRole } from './service-role.entity';

@Entity('serving_groups')
export class ServingGroup extends IdTimestampBaseEntity {
    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'service_role_id', nullable: true })
    serviceRoleId: number;

    @ManyToOne(() => ServiceRole, (role) => role.servingGroups, { nullable: true })
    @JoinColumn({ name: 'service_role_id' })
    serviceRole: ServiceRole;

    @OneToMany(() => ServingGroupMember, (member) => member.servingGroup)
    members: ServingGroupMember[];

    @OneToMany(() => ServiceAssignment, (assignment) => assignment.servingGroup)
    assignments: ServiceAssignment[];
}
