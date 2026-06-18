import { Column, Entity, OneToMany } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { ServiceRoleCategory } from '../enums/service-role-category.enum';
import { DepartmentRoleEligibility } from './department-role-eligibility.entity';
import { MemberServiceCapability } from './member-service-capability.entity';
import { WorshipServiceTypeRole } from './worship-service-type-role.entity';
import { ServiceAssignment } from './service-assignment.entity';
import { ServingGroup } from './serving-group.entity';

@Entity('service_roles')
export class ServiceRole extends IdTimestampBaseEntity {
    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: ServiceRoleCategory,
        default: ServiceRoleCategory.SUPPORT_AND_CARE,
    })
    category: ServiceRoleCategory;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'allows_guest_assignment', default: false })
    allowsGuestAssignment: boolean;

    @OneToMany(() => DepartmentRoleEligibility, (eligibility) => eligibility.serviceRole)
    departmentEligibilities: DepartmentRoleEligibility[];

    @OneToMany(() => MemberServiceCapability, (capability) => capability.serviceRole)
    memberCapabilities: MemberServiceCapability[];

    @OneToMany(() => WorshipServiceTypeRole, (typeRole) => typeRole.serviceRole)
    worshipTypeRoles: WorshipServiceTypeRole[];

    @OneToMany(() => ServiceAssignment, (assignment) => assignment.serviceRole)
    assignments: ServiceAssignment[];

    @OneToMany(() => ServingGroup, (group) => group.serviceRole)
    servingGroups: ServingGroup[];
}
