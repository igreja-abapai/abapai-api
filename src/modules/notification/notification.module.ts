import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { UserModule } from '../user/user.module';
import { MemberModule } from '../member/member.module';
import { BirthdayNotificationCron } from './birthday-notification.cron';
import { BirthdayNotificationService } from './birthday-notification.service';
import { InternalCronController } from './internal-cron.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Notification]), UserModule, MemberModule],
    providers: [NotificationService, BirthdayNotificationService, BirthdayNotificationCron],
    controllers: [NotificationController, InternalCronController],
    exports: [NotificationService],
})
export class NotificationModule {}
