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
import { AssetLocationService } from './asset-location.service';
import { CreateAssetLocationDto, UpdateAssetLocationDto } from './dto/asset-location.dto';

@Controller('asset-locations')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AssetLocationsController {
    constructor(private readonly locationService: AssetLocationService) {}

    @Post()
    @Permissions('gerenciar_patrimonio')
    async create(@Body() dto: CreateAssetLocationDto, @Request() req: any) {
        return await this.locationService.create(dto, req.user.id);
    }

    @Get()
    @Permissions('visualizar_patrimonio')
    async findAll() {
        return await this.locationService.findAll();
    }

    @Get(':id')
    @Permissions('visualizar_patrimonio')
    async findById(@Param('id') id: string) {
        return await this.locationService.findById(+id);
    }

    @Patch(':id')
    @Permissions('gerenciar_patrimonio')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateAssetLocationDto,
        @Request() req: any,
    ) {
        return await this.locationService.update(+id, dto, req.user.id);
    }

    @Delete(':id')
    @Permissions('gerenciar_patrimonio')
    async remove(@Param('id') id: string, @Request() req: any) {
        await this.locationService.remove(+id, req.user.id);
        return { success: true };
    }
}
