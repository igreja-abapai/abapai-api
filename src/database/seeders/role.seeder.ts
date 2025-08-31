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
                description: 'Administrador com acesso total',
                permissions: [
                    'visualizar_membros',
                    'criar_membros',
                    'editar_membros',
                    'excluir_membros',
                    'visualizar_pedidos_oracao',
                    'criar_pedidos_oracao',
                    'excluir_pedidos_oracao',
                    'visualizar_usuarios',
                    'criar_usuarios',
                    'editar_usuarios',
                    'excluir_usuarios',
                    'alterar_senha_usuario',
                    'alterar_cargo_usuario',
                    'gerenciar_website',
                ],
            },
            {
                name: 'tesoureiro',
                description: 'Tesoureiro com acesso ao módulo financeiro',
                permissions: ['visualizar_membros'],
            },
            {
                name: 'secretario',
                description: 'Secretário com acesso a membros e dados relacionados',
                permissions: [
                    'visualizar_membros',
                    'criar_membros',
                    'editar_membros',
                    'excluir_membros',
                    'visualizar_pedidos_oracao',
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
