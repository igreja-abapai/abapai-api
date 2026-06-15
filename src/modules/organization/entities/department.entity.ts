import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { DepartmentType } from '../enums/department-type.enum';
import { MemberDepartment } from './member-department.entity';
import { DepartmentRoleEligibility } from './department-role-eligibility.entity';
import { DepartmentPositionEligibility } from './department-position-eligibility.entity';

@Entity('departments')
export class Department extends IdTimestampBaseEntity {
    @Column()
    name: string;

    @Column({ type: 'enum', enum: DepartmentType, default: DepartmentType.DEPARTMENT })
    type: DepartmentType;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'parent_id', nullable: true })
    parentId: number;

    @ManyToOne(() => Department, (department) => department.children, { nullable: true })
    @JoinColumn({ name: 'parent_id' })
    parent: Department;

    @OneToMany(() => Department, (department) => department.parent)
    children: Department[];

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @OneToMany(() => MemberDepartment, (memberDepartment) => memberDepartment.department)
    memberDepartments: MemberDepartment[];

    @OneToMany(() => DepartmentRoleEligibility, (eligibility) => eligibility.department)
    roleEligibilities: DepartmentRoleEligibility[];

    @OneToMany(() => DepartmentPositionEligibility, (eligibility) => eligibility.department)
    positionEligibilities: DepartmentPositionEligibility[];
}
