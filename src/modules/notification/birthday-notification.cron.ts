import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from './notification.service';
import { UserService } from '../user/user.service';
import { MemberService } from '../member/member.service';

@Injectable()
export class BirthdayNotificationCron {
    private readonly logger = new Logger(BirthdayNotificationCron.name);

    constructor(
        private readonly notificationService: NotificationService,
        private readonly userService: UserService,
        private readonly memberService: MemberService,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_1PM)
    async handleBirthdayNotifications() {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        this.logger.log(
            `Birthday cron ran. serverNow=${today.toISOString()} month=${month} day=${day}`,
        );

        const members = await this.memberService.findMembersWithBirthdayToday(month, day);

        if (!members.length) {
            this.logger.log('No birthdays found for today.');
            return;
        }

        const users = await this.userService.findUsersWithRoles(['admin', 'secretario']);

        if (!users.length) {
            this.logger.warn('No recipients found (admin/secretario). Skipping notification.');
            return;
        }

        const recipientIds = users.map((u) => u.id);
        const memberNamesHtml = members.map((m) => `<b>${m.name}</b>`).join(', ');
        const message = `<p>Hoje é aniversário de: ${memberNamesHtml}</p>`;

        await this.notificationService.sendNotification({
            title: 'Aniversariante do dia',
            message,
            type: 'birthday',
            data: { members: members.map((m) => ({ id: m.id, name: m.name })) },
            recipientIds,
        });

        this.logger.log(
            `Birthday notification sent. recipients=${recipientIds.length} birthdays=${members.length}`,
        );
    }
}
