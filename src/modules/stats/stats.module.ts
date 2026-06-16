import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../member/entities/member.entity';
import { ChurchPosition } from '../organization/entities/church-position.entity';
import { DepartmentRoleEligibility } from '../organization/entities/department-role-eligibility.entity';
import { Department } from '../organization/entities/department.entity';
import { MemberDepartment } from '../organization/entities/member-department.entity';
import { MemberServiceCapability } from '../organization/entities/member-service-capability.entity';
import { ServiceRole } from '../organization/entities/service-role.entity';
import { ServingGroupMember } from '../organization/entities/serving-group-member.entity';
import { ServingGroup } from '../organization/entities/serving-group.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Member,
            Department,
            MemberDepartment,
            ChurchPosition,
            ServiceRole,
            MemberServiceCapability,
            DepartmentRoleEligibility,
            ServingGroup,
            ServingGroupMember,
        ]),
    ],
    controllers: [StatsController],
    providers: [StatsService],
    exports: [StatsService],
})
export class StatsModule {}
