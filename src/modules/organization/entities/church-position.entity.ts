import { Column, Entity, OneToMany } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { ChurchPositionCategory } from '../enums/church-position-category.enum';
import { DepartmentPositionEligibility } from './department-position-eligibility.entity';

@Entity('church_positions')
export class ChurchPosition extends IdTimestampBaseEntity {
    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: ChurchPositionCategory,
        default: ChurchPositionCategory.MINISTERIAL,
    })
    category: ChurchPositionCategory;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'sort_order', nullable: true })
    sortOrder: number;

    @OneToMany(() => DepartmentPositionEligibility, (eligibility) => eligibility.churchPosition)
    departmentEligibilities: DepartmentPositionEligibility[];
}
