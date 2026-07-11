import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { YoutubeLiveService } from './youtube-live.service';

const DEFAULT_DEV_POLLING_INTERVAL_MS = 2 * 60 * 1000;

@Injectable()
export class YoutubeLiveDevPollingService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(YoutubeLiveDevPollingService.name);

    private intervalId: ReturnType<typeof setInterval> | null = null;

    constructor(
        private readonly configService: ConfigService,
        private readonly youtubeLiveService: YoutubeLiveService,
    ) {}

    onModuleInit(): void {
        if (!this.isDevPollingEnabled()) {
            return;
        }

        const intervalMs = this.getPollingIntervalMs();
        this.logger.warn(
            `YouTube live dev polling enabled (every ${intervalMs / 1000}s). Disable with YOUTUBE_LIVE_DEV_POLLING=false before deploy.`,
        );

        void this.runSync('startup');
        this.intervalId = setInterval(() => {
            void this.runSync('interval');
        }, intervalMs);
    }

    onModuleDestroy(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private isDevPollingEnabled(): boolean {
        return this.configService.get<string>('YOUTUBE_LIVE_DEV_POLLING') === 'true';
    }

    private getPollingIntervalMs(): number {
        const raw = this.configService.get<string>('YOUTUBE_LIVE_DEV_POLLING_INTERVAL_MS');
        const parsed = Number(raw);
        if (!Number.isFinite(parsed) || parsed < 30_000) {
            return DEFAULT_DEV_POLLING_INTERVAL_MS;
        }
        return parsed;
    }

    private async runSync(trigger: 'startup' | 'interval'): Promise<void> {
        try {
            const result = await this.youtubeLiveService.forceSync();
            this.logger.log(
                `[${trigger}] sync ok — live=${result.isLive} upcoming=${result.upcomingCount} mode=${result.syncMode}`,
            );
        } catch (error) {
            this.logger.error(`[${trigger}] sync failed`, error as Error);
        }
    }
}
