import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { Member } from './entities/member.entity';
import { MemberDiscipleshipCase } from './entities/member-discipleship-case.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Member, MemberDiscipleshipCase])],
    controllers: [MemberController],
    providers: [MemberService],
    exports: [MemberService],
})
export class MemberModule {}
