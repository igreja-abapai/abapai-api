import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { ChurchPosition } from './church-position.entity';
import { Department } from './department.entity';

@Entity('department_position_eligibility')
@Unique(['departmentId', 'churchPositionId'])
export class DepartmentPositionEligibility extends IdTimestampBaseEntity {
    @Column({ name: 'department_id' })
    departmentId: number;

    @ManyToOne(() => Department, (department) => department.positionEligibilities, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'department_id' })
    department: Department;

    @Column({ name: 'church_position_id' })
    churchPositionId: number;

    @ManyToOne(() => ChurchPosition, (position) => position.departmentEligibilities, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'church_position_id' })
    churchPosition: ChurchPosition;
}
