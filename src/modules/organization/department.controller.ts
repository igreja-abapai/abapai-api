import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import {
    CreateDepartmentDto,
    CreateMemberDepartmentDto,
    UpdateDepartmentDto,
    UpdateMemberDepartmentDto,
} from './dto/department.dto';
import { DepartmentService } from './department.service';

@Controller('organization/departments')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) {}

    @Post()
    @Permissions('gerenciar_departamentos')
    async createDepartment(@Body() dto: CreateDepartmentDto, @Request() req: any) {
        return await this.departmentService.createDepartment(dto, req.user.id);
    }

    @Get()
    @Permissions('visualizar_organizacao')
    async findAllDepartments() {
        return await this.departmentService.findAllDepartments();
    }

    @Get(':id')
    @Permissions('visualizar_organizacao')
    async findDepartmentById(@Param('id') id: string) {
        return await this.departmentService.findDepartmentById(+id);
    }

    @Patch(':id')
    @Permissions('gerenciar_departamentos')
    async updateDepartment(
        @Param('id') id: string,
        @Body() dto: UpdateDepartmentDto,
        @Request() req: any,
    ) {
        return await this.departmentService.updateDepartment(+id, dto, req.user.id);
    }

    @Delete(':id')
    @Permissions('gerenciar_departamentos')
    async removeDepartment(@Param('id') id: string, @Request() req: any) {
        return await this.departmentService.removeDepartment(+id, req.user.id);
    }

    @Post('member-departments')
    @Permissions('gerenciar_departamentos')
    async createMemberDepartment(@Body() dto: CreateMemberDepartmentDto, @Request() req: any) {
        return await this.departmentService.createMemberDepartment(dto, req.user.id);
    }

    @Get('member-departments/all')
    @Permissions('visualizar_organizacao')
    async findAllMemberDepartments() {
        return await this.departmentService.findAllMemberDepartments();
    }

    @Get('member-departments/:id')
    @Permissions('visualizar_organizacao')
    async findMemberDepartmentById(@Param('id') id: string) {
        return await this.departmentService.findMemberDepartmentById(+id);
    }

    @Patch('member-departments/:id')
    @Permissions('gerenciar_departamentos')
    async updateMemberDepartment(
        @Param('id') id: string,
        @Body() dto: UpdateMemberDepartmentDto,
        @Request() req: any,
    ) {
        return await this.departmentService.updateMemberDepartment(+id, dto, req.user.id);
    }

    @Delete('member-departments/:id')
    @Permissions('gerenciar_departamentos')
    async removeMemberDepartment(@Param('id') id: string, @Request() req: any) {
        return await this.departmentService.removeMemberDepartment(+id, req.user.id);
    }
}
