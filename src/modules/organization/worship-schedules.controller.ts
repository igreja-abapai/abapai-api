import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import {
    CreateServingGroupDto,
    CreateServingGroupMemberDto,
    UpdateServingGroupDto,
    UpdateServingGroupMemberDto,
} from './dto/serving-group.dto';
import {
    AssignServiceAssignmentDto,
    CopyWorshipServiceAssignmentsDto,
    CreateWorshipServiceDto,
    CreateWorshipServiceFromTemplateDto,
    CreateWorshipServicesFromTemplateByWeekdayDto,
    CreateWorshipServiceTypeDto,
    CreateWorshipServiceTypeRoleDto,
    GenerateWorshipAssignmentsMonthDto,
    GenerateWorshipServicesMonthDto,
    UpdateWorshipServiceDto,
    UpdateWorshipServiceTypeDto,
    UpdateWorshipServiceTypeRoleDto,
} from './dto/worship-schedule.dto';
import { ServingGroupService } from './serving-group.service';
import { WorshipScheduleService } from './worship-schedule.service';

@Controller('organization/worship-schedules')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class WorshipSchedulesController {
    constructor(
        private readonly worshipScheduleService: WorshipScheduleService,
        private readonly servingGroupService: ServingGroupService,
    ) {}

    @Post('service-types')
    @Permissions('gerenciar_escalas')
    async createWorshipServiceType(@Body() dto: CreateWorshipServiceTypeDto, @Request() req: any) {
        return await this.worshipScheduleService.createWorshipServiceType(dto, req.user.id);
    }

    @Get('service-types')
    @Permissions('visualizar_organizacao')
    async findAllWorshipServiceTypes() {
        return await this.worshipScheduleService.findAllWorshipServiceTypes();
    }

    @Get('service-types/:id')
    @Permissions('visualizar_organizacao')
    async findWorshipServiceTypeById(@Param('id') id: string) {
        return await this.worshipScheduleService.findWorshipServiceTypeById(+id);
    }

    @Patch('service-types/:id')
    @Permissions('gerenciar_escalas')
    async updateWorshipServiceType(
        @Param('id') id: string,
        @Body() dto: UpdateWorshipServiceTypeDto,
        @Request() req: any,
    ) {
        return await this.worshipScheduleService.updateWorshipServiceType(+id, dto, req.user.id);
    }

    @Delete('service-types/:id')
    @Permissions('gerenciar_escalas')
    async removeWorshipServiceType(@Param('id') id: string, @Request() req: any) {
        return await this.worshipScheduleService.removeWorshipServiceType(+id, req.user.id);
    }

    @Post('service-type-roles')
    @Permissions('gerenciar_escalas')
    async createWorshipServiceTypeRole(
        @Body() dto: CreateWorshipServiceTypeRoleDto,
        @Request() req: any,
    ) {
        return await this.worshipScheduleService.createWorshipServiceTypeRole(dto, req.user.id);
    }

    @Get('service-type-roles')
    @Permissions('visualizar_organizacao')
    async findAllWorshipServiceTypeRoles() {
        return await this.worshipScheduleService.findAllWorshipServiceTypeRoles();
    }

    @Get('service-type-roles/:id')
    @Permissions('visualizar_organizacao')
    async findWorshipServiceTypeRoleById(@Param('id') id: string) {
        return await this.worshipScheduleService.findWorshipServiceTypeRoleById(+id);
    }

    @Patch('service-type-roles/:id')
    @Permissions('gerenciar_escalas')
    async updateWorshipServiceTypeRole(
        @Param('id') id: string,
        @Body() dto: UpdateWorshipServiceTypeRoleDto,
        @Request() req: any,
    ) {
        return await this.worshipScheduleService.updateWorshipServiceTypeRole(
            +id,
            dto,
            req.user.id,
        );
    }

    @Delete('service-type-roles/:id')
    @Permissions('gerenciar_escalas')
    async removeWorshipServiceTypeRole(@Param('id') id: string, @Request() req: any) {
        return await this.worshipScheduleService.removeWorshipServiceTypeRole(+id, req.user.id);
    }

    @Post('serving-groups')
    @Permissions('gerenciar_escalas')
    async createServingGroup(@Body() dto: CreateServingGroupDto, @Request() req: any) {
        return await this.servingGroupService.createServingGroup(dto, req.user.id);
    }

    @Get('serving-groups')
    @Permissions('visualizar_organizacao')
    async findAllServingGroups() {
        return await this.servingGroupService.findAllServingGroups();
    }

    @Get('serving-groups/:id')
    @Permissions('visualizar_organizacao')
    async findServingGroupById(@Param('id') id: string) {
        return await this.servingGroupService.findServingGroupById(+id);
    }

    @Patch('serving-groups/:id')
    @Permissions('gerenciar_escalas')
    async updateServingGroup(
        @Param('id') id: string,
        @Body() dto: UpdateServingGroupDto,
        @Request() req: any,
    ) {
        return await this.servingGroupService.updateServingGroup(+id, dto, req.user.id);
    }

    @Delete('serving-groups/:id')
    @Permissions('gerenciar_escalas')
    async removeServingGroup(@Param('id') id: string, @Request() req: any) {
        return await this.servingGroupService.removeServingGroup(+id, req.user.id);
    }

    @Post('serving-group-members')
    @Permissions('gerenciar_escalas')
    async createServingGroupMember(@Body() dto: CreateServingGroupMemberDto, @Request() req: any) {
        return await this.servingGroupService.createServingGroupMember(dto, req.user.id);
    }

    @Get('serving-group-members')
    @Permissions('visualizar_organizacao')
    async findAllServingGroupMembers() {
        return await this.servingGroupService.findAllServingGroupMembers();
    }

    @Get('serving-group-members/:id')
    @Permissions('visualizar_organizacao')
    async findServingGroupMemberById(@Param('id') id: string) {
        return await this.servingGroupService.findServingGroupMemberById(+id);
    }

    @Patch('serving-group-members/:id')
    @Permissions('gerenciar_escalas')
    async updateServingGroupMember(
        @Param('id') id: string,
        @Body() dto: UpdateServingGroupMemberDto,
        @Request() req: any,
    ) {
        return await this.servingGroupService.updateServingGroupMember(+id, dto, req.user.id);
    }

    @Delete('serving-group-members/:id')
    @Permissions('gerenciar_escalas')
    async removeServingGroupMember(@Param('id') id: string, @Request() req: any) {
        return await this.servingGroupService.removeServingGroupMember(+id, req.user.id);
    }

    @Post('services')
    @Permissions('gerenciar_escalas')
    async createWorshipService(@Body() dto: CreateWorshipServiceDto, @Request() req: any) {
        return await this.worshipScheduleService.createWorshipService(dto, req.user.id);
    }

    @Post('services/from-template')
    @Permissions('gerenciar_escalas')
    async createWorshipServiceFromTemplate(
        @Body() dto: CreateWorshipServiceFromTemplateDto,
        @Request() req: any,
    ) {
        return await this.worshipScheduleService.createWorshipServiceFromTemplate(dto, req.user.id);
    }

    @Post('services/from-template/by-weekday')
    @Permissions('gerenciar_escalas')
    async createWorshipServicesFromTemplateByWeekday(
        @Body() dto: CreateWorshipServicesFromTemplateByWeekdayDto,
        @Request() req: any,
    ) {
        return await this.worshipScheduleService.createWorshipServicesFromTemplateByWeekday(
            dto,
            req.user.id,
        );
    }

    @Post('services/generate-month')
    @Permissions('gerenciar_escalas')
    async generateInstancesForMonth(
        @Body() dto: GenerateWorshipServicesMonthDto,
        @Request() req: any,
    ) {
        return await this.worshipScheduleService.generateInstancesForMonth(dto, req.user.id);
    }

    @Post('services/generate-assignments-month')
    @Permissions('gerenciar_escalas')
    async generateAssignmentsForMonth(
        @Body() dto: GenerateWorshipAssignmentsMonthDto,
        @Request() req: any,
    ) {
        return await this.worshipScheduleService.generateAssignmentsForMonth(dto, req.user.id);
    }

    @Get('services')
    @Permissions('visualizar_organizacao')
    async findAllWorshipServices(@Query('month') month?: string, @Query('year') year?: string) {
        if (month && year) {
            return await this.worshipScheduleService.findWorshipServicesByMonth(+month, +year);
        }
        return await this.worshipScheduleService.findAllWorshipServices();
    }

    @Delete('services/month/assignments')
    @Permissions('gerenciar_escalas')
    async clearWorshipServiceAssignmentsForMonth(
        @Query('month') month: string,
        @Query('year') year: string,
        @Request() req: any,
    ) {
        return await this.worshipScheduleService.clearWorshipServiceAssignmentsForMonth(
            +month,
            +year,
            req.user.id,
        );
    }

    @Delete('services/month')
    @Permissions('gerenciar_escalas')
    async removeWorshipServicesForMonth(
        @Query('month') month: string,
        @Query('year') year: string,
        @Request() req: any,
    ) {
        return await this.worshipScheduleService.removeWorshipServicesForMonth(
            +month,
            +year,
            req.user.id,
        );
    }

    @Patch('services/month/confirm')
    @Permissions('gerenciar_escalas')
    async confirmWorshipServicesForMonth(
        @Query('month') month: string,
        @Query('year') year: string,
        @Request() req: any,
    ) {
        return await this.worshipScheduleService.confirmWorshipServicesForMonth(
            +month,
            +year,
            req.user.id,
        );
    }

    @Get('services/:id')
    @Permissions('visualizar_organizacao')
    async findWorshipServiceById(@Param('id') id: string) {
        return await this.worshipScheduleService.findWorshipServiceById(+id);
    }

    @Patch('services/:id')
    @Permissions('gerenciar_escalas')
    async updateWorshipService(
        @Param('id') id: string,
        @Body() dto: UpdateWorshipServiceDto,
        @Request() req: any,
    ) {
        return await this.worshipScheduleService.updateWorshipService(+id, dto, req.user.id);
    }

    @Delete('services/:id')
    @Permissions('gerenciar_escalas')
    async removeWorshipService(@Param('id') id: string, @Request() req: any) {
        return await this.worshipScheduleService.removeWorshipService(+id, req.user.id);
    }

    @Patch('services/:id/assign')
    @Permissions('gerenciar_escalas')
    async assignMemberOrGroup(
        @Param('id') id: string,
        @Body() dto: AssignServiceAssignmentDto,
        @Request() req: any,
    ) {
        return await this.worshipScheduleService.assignMemberOrGroup(+id, dto, req.user.id);
    }

    @Patch('services/:id/publish')
    @Permissions('publicar_escalas')
    async publishWorshipService(@Param('id') id: string, @Request() req: any) {
        return await this.worshipScheduleService.publishWorshipService(+id, req.user.id);
    }

    @Patch('services/:id/confirm')
    @Permissions('gerenciar_escalas')
    async confirmWorshipService(@Param('id') id: string, @Request() req: any) {
        return await this.worshipScheduleService.confirmWorshipService(+id, req.user.id);
    }

    @Patch('services/:id/copy-assignments')
    @Permissions('gerenciar_escalas')
    async copyAssignmentsFromAnotherService(
        @Param('id') id: string,
        @Body() dto: CopyWorshipServiceAssignmentsDto,
        @Request() req: any,
    ) {
        return await this.worshipScheduleService.copyAssignmentsFromAnotherService(
            +id,
            dto,
            req.user.id,
        );
    }

    @Get('assignments/:assignmentId/eligible-members')
    @Permissions('visualizar_organizacao')
    async getEligibleMembersForAssignmentSlot(@Param('assignmentId') assignmentId: string) {
        return await this.worshipScheduleService.getEligibleMembersForAssignmentSlot(+assignmentId);
    }
}
