import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { User } from '../../modules/user/entities/user.entity';
import { Role } from '../../modules/role/entities/role.entity';
import { EncryptionService } from '../../shared/services/encryption/encryption.service';

export default class UserSeeder implements Seeder {
    private readonly DEFAULT_PASSWORD = 'Admin1234';

    public async run(dataSource: DataSource): Promise<void> {
        const userRepository = dataSource.getRepository(User);
        const roleRepository = dataSource.getRepository(Role);
        const encryptionService = new EncryptionService();

        // Get admin role
        const adminRole = await roleRepository.findOne({
            where: { name: 'admin' },
        });

        if (!adminRole) {
            console.log('⚠️ Admin role not found. Make sure roles are seeded first.');
            return;
        }

        // Create or update admin user
        let adminUser = await userRepository.findOne({
            where: { email: 'raimundo.feliciano@hotmail.com' },
        });

        if (!adminUser) {
            const hashedPassword = encryptionService.hashSync(this.DEFAULT_PASSWORD);

            adminUser = userRepository.create({
                firstName: 'Raimundo',
                lastName: 'Feliciano',
                email: 'raimundo.feliciano@hotmail.com',
                password: hashedPassword,
                roleId: adminRole.id,
            });

            await userRepository.save(adminUser);
            console.log('✅ Admin user created:', adminUser.email);
        } else {
            // Update existing user to have admin role if they don't have one
            let updated = false;
            if (!adminUser.roleId) {
                adminUser.roleId = adminRole.id;
                updated = true;
            }
            if (updated) {
                await userRepository.save(adminUser);
                console.log('✅ Admin user updated with role:', adminUser.email);
            } else {
                console.log('✅ Admin user already exists:', adminUser.email);
            }
        }
    }
}
