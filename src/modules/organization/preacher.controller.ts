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
import { CreatePreacherDto, UpdatePreacherDto } from './dto/preacher.dto';
import { PreacherService } from './preacher.service';

@Controller('organization/preachers')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class PreacherController {
    constructor(private readonly preacherService: PreacherService) {}

    @Post()
    @Permissions('gerenciar_escalas')
    async create(@Body() dto: CreatePreacherDto, @Request() req: any) {
        return await this.preacherService.create(dto, req.user.id);
    }

    @Get()
    @Permissions('visualizar_organizacao')
    async findAll() {
        return await this.preacherService.findAll();
    }

    @Get(':id/schedule-history')
    @Permissions('visualizar_organizacao')
    async getScheduleHistory(@Param('id') id: string) {
        return await this.preacherService.getScheduleHistory(+id);
    }

    @Get(':id')
    @Permissions('visualizar_organizacao')
    async findById(@Param('id') id: string) {
        return await this.preacherService.findById(+id);
    }

    @Patch(':id')
    @Permissions('gerenciar_escalas')
    async update(@Param('id') id: string, @Body() dto: UpdatePreacherDto, @Request() req: any) {
        return await this.preacherService.update(+id, dto, req.user.id);
    }

    @Delete(':id')
    @Permissions('gerenciar_escalas')
    async remove(@Param('id') id: string, @Request() req: any) {
        await this.preacherService.remove(+id, req.user.id);
        return { success: true };
    }
}
