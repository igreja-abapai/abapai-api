import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { DatabaseSeederService } from './database/seeder/database-seeder.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { VerificationCodeModule } from './modules/verification-code/verification-code.module';
import { PrayerRequestModule } from './modules/prayer-request/prayer-request.module';
import { MemberModule } from './modules/member/member.module';
import { AddressModule } from './modules/address/address.module';
import { PermissionModule } from './modules/permission/permission.module';
import { RoleModule } from './modules/role/role.module';
import { AwsModule } from './modules/aws/aws.module';
import { NotificationModule } from './modules/notification/notification.module';
import { WebsiteModule } from './modules/website/website.module';
import { ScheduleEventModule } from './modules/schedule-event/schedule-event.module';
import { CarouselImageModule } from './modules/carousel-image/carousel-image.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        UserModule,
        AuthModule,
        VerificationCodeModule,
        PrayerRequestModule,
        MemberModule,
        AddressModule,
        PermissionModule,
        RoleModule,
        AwsModule,
        ScheduleModule.forRoot(),
        NotificationModule,
        WebsiteModule,
        ScheduleEventModule,
        CarouselImageModule,
    ],
    controllers: [],
    providers: [DatabaseSeederService],
})
export class AppModule {}
