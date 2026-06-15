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
    CreateDepartmentRoleEligibilityDto,
    CreateMemberServiceCapabilityDto,
    CreateServiceRoleDto,
    UpdateDepartmentRoleEligibilityDto,
    UpdateMemberServiceCapabilityDto,
    UpdateServiceRoleDto,
} from './dto/service-role.dto';
import { ServiceRoleService } from './service-role.service';

@Controller('organization/service-roles')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ServiceRoleController {
    constructor(private readonly serviceRoleService: ServiceRoleService) {}

    @Post()
    @Permissions('gerenciar_funcoes_servico')
    async createServiceRole(@Body() dto: CreateServiceRoleDto, @Request() req: any) {
        return await this.serviceRoleService.createServiceRole(dto, req.user.id);
    }

    @Get()
    @Permissions('visualizar_organizacao', 'visualizar_membros')
    async findAllServiceRoles() {
        return await this.serviceRoleService.findAllServiceRoles();
    }

    @Get(':id')
    @Permissions('visualizar_organizacao')
    async findServiceRoleById(@Param('id') id: string) {
        return await this.serviceRoleService.findServiceRoleById(+id);
    }

    @Patch(':id')
    @Permissions('gerenciar_funcoes_servico')
    async updateServiceRole(
        @Param('id') id: string,
        @Body() dto: UpdateServiceRoleDto,
        @Request() req: any,
    ) {
        return await this.serviceRoleService.updateServiceRole(+id, dto, req.user.id);
    }

    @Delete(':id')
    @Permissions('gerenciar_funcoes_servico')
    async removeServiceRole(@Param('id') id: string, @Request() req: any) {
        return await this.serviceRoleService.removeServiceRole(+id, req.user.id);
    }

    @Get(':id/eligible-members')
    @Permissions('visualizar_organizacao')
    async getEligibleMembers(@Param('id') id: string) {
        return await this.serviceRoleService.getEligibleMembers(+id);
    }

    @Post('member-capabilities')
    @Permissions('gerenciar_funcoes_servico')
    async createMemberCapability(
        @Body() dto: CreateMemberServiceCapabilityDto,
        @Request() req: any,
    ) {
        return await this.serviceRoleService.createMemberCapability(dto, req.user.id);
    }

    @Get('member-capabilities/all')
    @Permissions('visualizar_organizacao', 'visualizar_membros')
    async findAllMemberCapabilities() {
        return await this.serviceRoleService.findAllMemberCapabilities();
    }

    @Get('member-capabilities/:id')
    @Permissions('visualizar_organizacao')
    async findMemberCapabilityById(@Param('id') id: string) {
        return await this.serviceRoleService.findMemberCapabilityById(+id);
    }

    @Patch('member-capabilities/:id')
    @Permissions('gerenciar_funcoes_servico')
    async updateMemberCapability(
        @Param('id') id: string,
        @Body() dto: UpdateMemberServiceCapabilityDto,
        @Request() req: any,
    ) {
        return await this.serviceRoleService.updateMemberCapability(+id, dto, req.user.id);
    }

    @Delete('member-capabilities/:id')
    @Permissions('gerenciar_funcoes_servico')
    async removeMemberCapability(@Param('id') id: string, @Request() req: any) {
        return await this.serviceRoleService.removeMemberCapability(+id, req.user.id);
    }

    @Post('department-role-eligibilities')
    @Permissions('gerenciar_funcoes_servico')
    async createDepartmentRoleEligibility(
        @Body() dto: CreateDepartmentRoleEligibilityDto,
        @Request() req: any,
    ) {
        return await this.serviceRoleService.createDepartmentRoleEligibility(dto, req.user.id);
    }

    @Get('department-role-eligibilities/all')
    @Permissions('visualizar_organizacao')
    async findAllDepartmentRoleEligibilities() {
        return await this.serviceRoleService.findAllDepartmentRoleEligibilities();
    }

    @Get('department-role-eligibilities/:id')
    @Permissions('visualizar_organizacao')
    async findDepartmentRoleEligibilityById(@Param('id') id: string) {
        return await this.serviceRoleService.findDepartmentRoleEligibilityById(+id);
    }

    @Patch('department-role-eligibilities/:id')
    @Permissions('gerenciar_funcoes_servico')
    async updateDepartmentRoleEligibility(
        @Param('id') id: string,
        @Body() dto: UpdateDepartmentRoleEligibilityDto,
        @Request() req: any,
    ) {
        return await this.serviceRoleService.updateDepartmentRoleEligibility(+id, dto, req.user.id);
    }

    @Delete('department-role-eligibilities/:id')
    @Permissions('gerenciar_funcoes_servico')
    async removeDepartmentRoleEligibility(@Param('id') id: string, @Request() req: any) {
        return await this.serviceRoleService.removeDepartmentRoleEligibility(+id, req.user.id);
    }
}
