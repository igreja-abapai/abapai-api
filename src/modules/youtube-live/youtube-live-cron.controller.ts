import { Controller, Get, UseGuards } from '@nestjs/common';
import { CronSecretGuard } from '../../shared/guards/cron-secret.guard';
import { YoutubeLiveService } from './youtube-live.service';

@Controller('internal/cron')
@UseGuards(CronSecretGuard)
export class YoutubeLiveCronController {
    constructor(private readonly youtubeLiveService: YoutubeLiveService) {}

    @Get('youtube-live-sync')
    async syncYoutubeLive() {
        const result = await this.youtubeLiveService.syncFromCron();
        return { ok: true, ...result };
    }
}
