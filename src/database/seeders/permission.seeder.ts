import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { Permission } from '../../modules/permission/entities/permission.entity';

export default class PermissionSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const permissionRepository = dataSource.getRepository(Permission);

        const permissions = [
            // Member permissions
            { code: 'view_members', description: 'View members' },
            { code: 'create_members', description: 'Create members' },
            { code: 'edit_members', description: 'Edit members' },
            { code: 'delete_members', description: 'Delete members' },

            // Prayer request permissions
            { code: 'view_prayer_requests', description: 'View prayer requests' },
            { code: 'create_prayer_requests', description: 'Create prayer requests' },
            { code: 'delete_prayer_requests', description: 'Delete prayer requests' },

            // User permissions
            { code: 'view_users', description: 'View users' },
            { code: 'create_users', description: 'Create users' },
            { code: 'edit_users', description: 'Edit users' },
            { code: 'delete_users', description: 'Delete users' },
            { code: 'change_user_password', description: 'Change user password' },
            { code: 'change_user_roles', description: 'Change user roles' },
        ];

        for (const permissionData of permissions) {
            const existingPermission = await permissionRepository.findOne({
                where: { code: permissionData.code },
            });

            if (!existingPermission) {
                const permission = permissionRepository.create(permissionData);
                await permissionRepository.save(permission);
            }
        }
    }
}
