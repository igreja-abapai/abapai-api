import { Column, Entity, ManyToMany } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { Role } from '../../role/entities/role.entity';

@Entity()
export class Permission extends IdTimestampBaseEntity {
    @Column({ unique: true })
    code: string;

    @Column()
    description: string;

    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[];
}
