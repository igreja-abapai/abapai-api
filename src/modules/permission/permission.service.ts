import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>,
    ) {}

    async findAll(): Promise<Permission[]> {
        return this.permissionRepository.find();
    }

    async findOne(id: number): Promise<Permission> {
        return this.permissionRepository.findOne({ where: { id } });
    }

    async findByCode(code: string): Promise<Permission> {
        return this.permissionRepository.findOne({ where: { code } });
    }

    async create(data: Partial<Permission>): Promise<Permission> {
        const permission = this.permissionRepository.create(data);
        return this.permissionRepository.save(permission);
    }
}
