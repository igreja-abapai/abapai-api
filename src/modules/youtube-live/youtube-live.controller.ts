import { Controller, Get, Header } from '@nestjs/common';
import { YoutubeLiveService } from './youtube-live.service';

@Controller('live')
export class YoutubeLiveController {
    constructor(private readonly youtubeLiveService: YoutubeLiveService) {}

    @Get('current')
    @Header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    getCurrent() {
        return this.youtubeLiveService.getCurrent();
    }
}
