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
    ],
    controllers: [],
    providers: [DatabaseSeederService],
})
export class AppModule {}
