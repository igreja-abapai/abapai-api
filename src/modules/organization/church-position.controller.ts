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
import { ChurchPositionService } from './church-position.service';
import {
    CreateChurchPositionDto,
    CreateDepartmentPositionEligibilityDto,
    UpdateChurchPositionDto,
    UpdateDepartmentPositionEligibilityDto,
} from './dto/church-position.dto';

@Controller('organization/church-positions')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ChurchPositionController {
    constructor(private readonly churchPositionService: ChurchPositionService) {}

    @Post()
    @Permissions('gerenciar_cargos_igreja')
    async createChurchPosition(@Body() dto: CreateChurchPositionDto, @Request() req: any) {
        return await this.churchPositionService.createChurchPosition(dto, req.user.id);
    }

    @Get()
    @Permissions('visualizar_organizacao', 'visualizar_membros')
    async findAllChurchPositions() {
        return await this.churchPositionService.findAllChurchPositions();
    }

    @Get(':id')
    @Permissions('visualizar_organizacao')
    async findChurchPositionById(@Param('id') id: string) {
        return await this.churchPositionService.findChurchPositionById(+id);
    }

    @Patch(':id')
    @Permissions('gerenciar_cargos_igreja')
    async updateChurchPosition(
        @Param('id') id: string,
        @Body() dto: UpdateChurchPositionDto,
        @Request() req: any,
    ) {
        return await this.churchPositionService.updateChurchPosition(+id, dto, req.user.id);
    }

    @Delete(':id')
    @Permissions('gerenciar_cargos_igreja')
    async removeChurchPosition(@Param('id') id: string, @Request() req: any) {
        return await this.churchPositionService.removeChurchPosition(+id, req.user.id);
    }

    @Post('department-position-eligibilities')
    @Permissions('gerenciar_cargos_igreja')
    async createDepartmentPositionEligibility(
        @Body() dto: CreateDepartmentPositionEligibilityDto,
        @Request() req: any,
    ) {
        return await this.churchPositionService.createDepartmentPositionEligibility(
            dto,
            req.user.id,
        );
    }

    @Get('department-position-eligibilities/all')
    @Permissions('visualizar_organizacao')
    async findAllDepartmentPositionEligibilities() {
        return await this.churchPositionService.findAllDepartmentPositionEligibilities();
    }

    @Get('department-position-eligibilities/:id')
    @Permissions('visualizar_organizacao')
    async findDepartmentPositionEligibilityById(@Param('id') id: string) {
        return await this.churchPositionService.findDepartmentPositionEligibilityById(+id);
    }

    @Patch('department-position-eligibilities/:id')
    @Permissions('gerenciar_cargos_igreja')
    async updateDepartmentPositionEligibility(
        @Param('id') id: string,
        @Body() dto: UpdateDepartmentPositionEligibilityDto,
        @Request() req: any,
    ) {
        return await this.churchPositionService.updateDepartmentPositionEligibility(
            +id,
            dto,
            req.user.id,
        );
    }

    @Delete('department-position-eligibilities/:id')
    @Permissions('gerenciar_cargos_igreja')
    async removeDepartmentPositionEligibility(@Param('id') id: string, @Request() req: any) {
        return await this.churchPositionService.removeDepartmentPositionEligibility(
            +id,
            req.user.id,
        );
    }
}
