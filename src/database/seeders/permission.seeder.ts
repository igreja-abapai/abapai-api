import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { Permission } from '../../modules/permission/entities/permission.entity';

export default class PermissionSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const permissionRepository = dataSource.getRepository(Permission);

        const permissions = [
            { code: 'visualizar_membros', description: 'Permissão para visualizar membros' },
            { code: 'criar_membros', description: 'Permissão para criar membros' },
            { code: 'editar_membros', description: 'Permissão para editar membros' },
            { code: 'excluir_membros', description: 'Permissão para excluir membros' },

            // Permissões de pedidos de oração
            {
                code: 'visualizar_pedidos_oracao',
                description: 'Permissão para visualizar pedidos de oração',
            },
            { code: 'criar_pedidos_oracao', description: 'Permissão para criar pedidos de oração' },
            {
                code: 'excluir_pedidos_oracao',
                description: 'Permissão para excluir pedidos de oração',
            },

            // Permissões de usuários
            { code: 'visualizar_usuarios', description: 'Permissão para visualizar usuários' },
            { code: 'criar_usuarios', description: 'Permissão para criar usuários' },
            { code: 'editar_usuarios', description: 'Permissão para editar usuários' },
            { code: 'excluir_usuarios', description: 'Permissão para excluir usuários' },
            {
                code: 'alterar_senha_usuario',
                description: 'Permissão para alterar senha de usuário',
            },
            {
                code: 'alterar_cargo_usuario',
                description: 'Permissão para alterar cargos de usuário',
            },
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
