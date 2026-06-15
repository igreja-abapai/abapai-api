import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { Department } from './department.entity';
import { ServiceRole } from './service-role.entity';

@Entity('department_role_eligibility')
@Unique(['departmentId', 'serviceRoleId'])
export class DepartmentRoleEligibility extends IdTimestampBaseEntity {
    @Column({ name: 'department_id' })
    departmentId: number;

    @ManyToOne(() => Department, (department) => department.roleEligibilities, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'department_id' })
    department: Department;

    @Column({ name: 'service_role_id' })
    serviceRoleId: number;

    @ManyToOne(() => ServiceRole, (serviceRole) => serviceRole.departmentEligibilities, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'service_role_id' })
    serviceRole: ServiceRole;

    @Column({ name: 'is_default', default: true })
    isDefault: boolean;
}
