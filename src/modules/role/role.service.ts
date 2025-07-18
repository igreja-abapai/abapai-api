import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { PermissionService } from '../permission/permission.service';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        private permissionService: PermissionService,
    ) {}

    async findAll(): Promise<Role[]> {
        return this.roleRepository.find({
            relations: ['permissions'],
        });
    }

    async findOne(id: number): Promise<Role> {
        return this.roleRepository.findOne({
            where: { id },
            relations: ['permissions'],
        });
    }

    async findByName(name: string): Promise<Role> {
        return this.roleRepository.findOne({
            where: { name },
            relations: ['permissions'],
        });
    }

    async create(data: Partial<Role>, permissionCodes: string[] = []): Promise<Role> {
        const role = this.roleRepository.create(data);

        if (permissionCodes.length > 0) {
            const permissions = await Promise.all(
                permissionCodes.map((code) => this.permissionService.findByCode(code)),
            );
            role.permissions = permissions.filter(Boolean);
        }

        return this.roleRepository.save(role);
    }

    async update(id: number, data: Partial<Role>, permissionCodes?: string[]): Promise<Role> {
        const role = await this.findOne(id);

        if (permissionCodes) {
            const permissions = await Promise.all(
                permissionCodes.map((code) => this.permissionService.findByCode(code)),
            );
            role.permissions = permissions.filter(Boolean);
        }

        Object.assign(role, data);
        return this.roleRepository.save(role);
    }
}
