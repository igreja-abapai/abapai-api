import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { Role } from '../../modules/role/entities/role.entity';
import { Permission } from '../../modules/permission/entities/permission.entity';

export default class RoleSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const roleRepository = dataSource.getRepository(Role);
        const permissionRepository = dataSource.getRepository(Permission);

        const rolesData = [
            {
                name: 'admin',
                description: 'Administrator with full access',
                permissions: [
                    'view_members',
                    'create_members',
                    'edit_members',
                    'delete_members',
                    'view_prayer_requests',
                    'create_prayer_requests',
                    'delete_prayer_requests',
                    'view_users',
                    'create_users',
                    'edit_users',
                    'delete_users',
                    'change_user_password',
                    'change_user_roles',
                ],
            },
            {
                name: 'tesoureiro',
                description: 'Treasurer with limited access',
                permissions: ['view_members'],
            },
            {
                name: 'secretario',
                description: 'Secretary with member and prayer request access',
                permissions: [
                    'view_members',
                    'create_members',
                    'edit_members',
                    'delete_members',
                    'view_prayer_requests',
                ],
            },
        ];

        for (const roleData of rolesData) {
            let role = await roleRepository.findOne({
                where: { name: roleData.name },
                relations: ['permissions'],
            });

            if (!role) {
                role = roleRepository.create({
                    name: roleData.name,
                    description: roleData.description,
                });
            }

            // Get permissions for this role
            const permissions = await permissionRepository
                .createQueryBuilder('permission')
                .where('permission.code IN (:...codes)', { codes: roleData.permissions })
                .getMany();

            role.permissions = permissions;
            await roleRepository.save(role);
        }
    }
}
