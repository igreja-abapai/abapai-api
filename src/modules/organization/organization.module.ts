import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsModule } from '../aws/aws.module';
import { Member } from '../member/entities/member.entity';
import { ChurchPositionController } from './church-position.controller';
import { ChurchPositionService } from './church-position.service';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { EligibilityService } from './eligibility.service';
import { ChurchPosition } from './entities/church-position.entity';
import { DepartmentPositionEligibility } from './entities/department-position-eligibility.entity';
import { DepartmentRoleEligibility } from './entities/department-role-eligibility.entity';
import { Department } from './entities/department.entity';
import { MemberDepartment } from './entities/member-department.entity';
import { MemberServiceCapability } from './entities/member-service-capability.entity';
import { ServiceAssignment } from './entities/service-assignment.entity';
import { ServiceRole } from './entities/service-role.entity';
import { ServingGroupMember } from './entities/serving-group-member.entity';
import { ServingGroup } from './entities/serving-group.entity';
import { WorshipServiceTypeRole } from './entities/worship-service-type-role.entity';
import { WorshipServiceType } from './entities/worship-service-type.entity';
import { WorshipService } from './entities/worship-service.entity';
import { ServiceRoleController } from './service-role.controller';
import { ServiceRoleService } from './service-role.service';
import { ServingGroupService } from './serving-group.service';
import { Preacher } from './entities/preacher.entity';
import { PreacherController } from './preacher.controller';
import { PreacherService } from './preacher.service';
import { WorshipSchedulesController } from './worship-schedules.controller';
import { WorshipScheduleService } from './worship-schedule.service';

@Module({
    imports: [
        AwsModule,
        TypeOrmModule.forFeature([
            Member,
            Department,
            MemberDepartment,
            ChurchPosition,
            DepartmentPositionEligibility,
            ServiceRole,
            DepartmentRoleEligibility,
            MemberServiceCapability,
            ServingGroup,
            ServingGroupMember,
            WorshipServiceType,
            WorshipServiceTypeRole,
            WorshipService,
            ServiceAssignment,
            Preacher,
        ]),
    ],
    controllers: [
        DepartmentController,
        ChurchPositionController,
        ServiceRoleController,
        PreacherController,
        WorshipSchedulesController,
    ],
    providers: [
        EligibilityService,
        DepartmentService,
        ChurchPositionService,
        ServiceRoleService,
        ServingGroupService,
        PreacherService,
        WorshipScheduleService,
    ],
    exports: [
        EligibilityService,
        DepartmentService,
        ChurchPositionService,
        ServiceRoleService,
        ServingGroupService,
        PreacherService,
        WorshipScheduleService,
    ],
})
export class OrganizationModule {}
