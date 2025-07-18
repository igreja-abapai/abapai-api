import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { IdTimestampBaseEntity } from '../../../shared/common/id-timestamp.base-entity';
import { Permission } from '../../permission/entities/permission.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Role extends IdTimestampBaseEntity {
    @Column({ unique: true })
    name: string;

    @Column()
    description: string;

    @ManyToMany(() => Permission, (permission) => permission.roles)
    @JoinTable({
        name: 'role_permissions',
        joinColumn: { name: 'roleId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
    })
    permissions: Permission[];

    @OneToMany(() => User, (user) => user.role)
    users: User[];
}
