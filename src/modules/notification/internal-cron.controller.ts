import { Controller, Get, UseGuards } from '@nestjs/common';
import { CronSecretGuard } from '../../shared/guards/cron-secret.guard';
import { BirthdayNotificationService } from './birthday-notification.service';

@Controller('internal/cron')
@UseGuards(CronSecretGuard)
export class InternalCronController {
    constructor(private readonly birthdayNotificationService: BirthdayNotificationService) {}

    @Get('birthday-notifications')
    async runBirthdayNotifications() {
        const result = await this.birthdayNotificationService.runBirthdayNotifications();
        return { ok: true, ...result };
    }
}
