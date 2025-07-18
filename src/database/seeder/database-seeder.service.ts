import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import PermissionSeeder from '../seeders/permission.seeder';
import RoleSeeder from '../seeders/role.seeder';
import UserSeeder from '../seeders/user.seeder';

@Injectable()
export class DatabaseSeederService {
    constructor(private readonly dataSource: DataSource) {}

    async seedDatabase() {
        try {
            console.log('🌱 Starting database seeding...');

            // Run seeders in order (permissions -> roles -> users)
            const permissionSeeder = new PermissionSeeder();
            await permissionSeeder.run(this.dataSource);
            console.log('✅ Permissions seeded');

            const roleSeeder = new RoleSeeder();
            await roleSeeder.run(this.dataSource);
            console.log('✅ Roles seeded');

            const userSeeder = new UserSeeder();
            await userSeeder.run(this.dataSource);
            console.log('✅ Users seeded');

            console.log('🎉 Database seeding completed successfully!');
        } catch (error) {
            console.error('❌ Database seeding failed:', error);
        }
    }
}
