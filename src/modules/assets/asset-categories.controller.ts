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
import { AssetCategoryService } from './asset-category.service';
import { CreateAssetCategoryDto, UpdateAssetCategoryDto } from './dto/asset-category.dto';

@Controller('asset-categories')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AssetCategoriesController {
    constructor(private readonly categoryService: AssetCategoryService) {}

    @Post()
    @Permissions('gerenciar_patrimonio')
    async create(@Body() dto: CreateAssetCategoryDto, @Request() req: any) {
        return await this.categoryService.create(dto, req.user.id);
    }

    @Get()
    @Permissions('visualizar_patrimonio')
    async findAll() {
        return await this.categoryService.findAll();
    }

    @Get(':id')
    @Permissions('visualizar_patrimonio')
    async findById(@Param('id') id: string) {
        return await this.categoryService.findById(+id);
    }

    @Patch(':id')
    @Permissions('gerenciar_patrimonio')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateAssetCategoryDto,
        @Request() req: any,
    ) {
        return await this.categoryService.update(+id, dto, req.user.id);
    }

    @Delete(':id')
    @Permissions('gerenciar_patrimonio')
    async remove(@Param('id') id: string, @Request() req: any) {
        await this.categoryService.remove(+id, req.user.id);
        return { success: true };
    }
}
