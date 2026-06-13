import { Injectable, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';
import { NotificationService } from './notification.service';
import { UserService } from '../user/user.service';
import { MemberService } from '../member/member.service';

export interface BirthdayNotificationResult {
    sent: boolean;
    birthdayCount: number;
    recipientCount: number;
    month: number;
    day: number;
}

@Injectable()
export class BirthdayNotificationService {
    private readonly logger = new Logger(BirthdayNotificationService.name);
    private static readonly TIMEZONE = 'America/Sao_Paulo';

    constructor(
        private readonly notificationService: NotificationService,
        private readonly userService: UserService,
        private readonly memberService: MemberService,
    ) {}

    async runBirthdayNotifications(): Promise<BirthdayNotificationResult> {
        const now = DateTime.now().setZone(BirthdayNotificationService.TIMEZONE);
        const month = now.month;
        const day = now.day;

        this.logger.log(
            `Birthday job ran. timezone=${BirthdayNotificationService.TIMEZONE} now=${now.toISO()} month=${month} day=${day}`,
        );

        const members = await this.memberService.findMembersWithBirthdayToday(month, day);

        if (!members.length) {
            this.logger.log('No birthdays found for today.');
            return { sent: false, birthdayCount: 0, recipientCount: 0, month, day };
        }

        const users = await this.userService.findUsersWithRoles(['admin', 'secretario']);

        if (!users.length) {
            this.logger.warn('No recipients found (admin/secretario). Skipping notification.');
            return { sent: false, birthdayCount: members.length, recipientCount: 0, month, day };
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

        return {
            sent: true,
            birthdayCount: members.length,
            recipientCount: recipientIds.length,
            month,
            day,
        };
    }
}
