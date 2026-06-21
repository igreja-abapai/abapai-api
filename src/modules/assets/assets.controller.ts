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
    Res,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { AssetsService } from './assets.service';
import { CreateAssetAttachmentDto } from './dto/asset-attachment.dto';
import { AssetQueryDto } from './dto/asset-query.dto';
import { CreateAssetDto, DisposeAssetDto, UpdateAssetDto } from './dto/asset.dto';

@Controller('assets')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) {}

    @Post()
    @Permissions('gerenciar_patrimonio')
    async create(@Body() dto: CreateAssetDto, @Request() req: any) {
        return await this.assetsService.create(dto, req.user.id);
    }

    @Get()
    @Permissions('visualizar_patrimonio')
    async findAll(@Query() query: AssetQueryDto) {
        return await this.assetsService.findAll(query);
    }

    @Get('summary')
    @Permissions('visualizar_patrimonio')
    async getSummary() {
        return await this.assetsService.getSummary();
    }

    @Get('export')
    @Permissions('visualizar_patrimonio')
    async export(@Query() query: AssetQueryDto, @Res() res: Response) {
        const buffer = await this.assetsService.exportExcel(query);
        const date = new Date().toISOString().slice(0, 10);
        const filename = `patrimonio-${date}.xlsx`;
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    }

    @Get(':id')
    @Permissions('visualizar_patrimonio')
    async findById(@Param('id') id: string) {
        return await this.assetsService.findById(+id);
    }

    @Patch(':id')
    @Permissions('gerenciar_patrimonio')
    async update(@Param('id') id: string, @Body() dto: UpdateAssetDto, @Request() req: any) {
        return await this.assetsService.update(+id, dto, req.user.id);
    }

    @Post(':id/dispose')
    @Permissions('gerenciar_patrimonio')
    async dispose(@Param('id') id: string, @Body() dto: DisposeAssetDto, @Request() req: any) {
        return await this.assetsService.dispose(+id, dto, req.user.id);
    }

    @Post(':id/reactivate')
    @Permissions('gerenciar_patrimonio')
    async reactivate(@Param('id') id: string, @Request() req: any) {
        return await this.assetsService.reactivate(+id, req.user.id);
    }

    @Post(':id/attachments')
    @Permissions('gerenciar_patrimonio')
    async addAttachment(
        @Param('id') id: string,
        @Body() dto: CreateAssetAttachmentDto,
        @Request() req: any,
    ) {
        return await this.assetsService.addAttachment(+id, dto, req.user.id);
    }

    @Delete(':id/attachments/:attachmentId')
    @Permissions('gerenciar_patrimonio')
    async removeAttachment(
        @Param('id') id: string,
        @Param('attachmentId') attachmentId: string,
        @Request() req: any,
    ) {
        await this.assetsService.removeAttachment(+id, +attachmentId, req.user.id);
        return { success: true };
    }
}
