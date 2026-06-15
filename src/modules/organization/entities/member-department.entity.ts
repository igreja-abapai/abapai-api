import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { MemberDepartmentRole } from '../enums/member-department-role.enum';
import { Department } from './department.entity';
import { Member } from '../../member/entities/member.entity';

@Entity('member_departments')
@Unique(['memberId', 'departmentId'])
export class MemberDepartment extends IdTimestampBaseEntity {
    @Column({ name: 'member_id' })
    memberId: number;

    @ManyToOne(() => Member, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'member_id' })
    member: Member;

    @Column({ name: 'department_id' })
    departmentId: number;

    @ManyToOne(() => Department, (department) => department.memberDepartments, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'department_id' })
    department: Department;

    @Column({ type: 'enum', enum: MemberDepartmentRole, default: MemberDepartmentRole.MEMBER })
    role: MemberDepartmentRole;

    @Column({ name: 'started_at', type: 'date', nullable: true })
    startedAt: Date;

    @Column({ name: 'ended_at', type: 'date', nullable: true })
    endedAt: Date;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;
}
