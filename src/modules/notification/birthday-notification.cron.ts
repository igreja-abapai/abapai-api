import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BirthdayNotificationService } from './birthday-notification.service';

@Injectable()
export class BirthdayNotificationCron {
    private readonly logger = new Logger(BirthdayNotificationCron.name);

    constructor(private readonly birthdayNotificationService: BirthdayNotificationService) {}

    @Cron(CronExpression.EVERY_DAY_AT_9AM, {
        disabled: process.env.VERCEL === '1',
    })
    async handleBirthdayNotifications() {
        this.logger.log('Local birthday cron triggered.');
        await this.birthdayNotificationService.runBirthdayNotifications();
    }
}
