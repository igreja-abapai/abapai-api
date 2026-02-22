import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';

@Controller('stats')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class StatsController {
    constructor(private readonly statsService: StatsService) {}

    @Get('members')
    @Permissions('visualizar_analises')
    async getMemberStats() {
        return await this.statsService.getMemberStats();
    }
}
