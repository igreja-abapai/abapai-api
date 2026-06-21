import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsModule } from '../aws/aws.module';
import { Member } from '../member/entities/member.entity';
import { Department } from '../organization/entities/department.entity';
import { AssetCategoriesController } from './asset-categories.controller';
import { AssetCategoryService } from './asset-category.service';
import { AssetLocationsController } from './asset-locations.controller';
import { AssetLocationService } from './asset-location.service';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { AssetAttachment } from './entities/asset-attachment.entity';
import { AssetCategory } from './entities/asset-category.entity';
import { AssetLocation } from './entities/asset-location.entity';
import { Asset } from './entities/asset.entity';

@Module({
    imports: [
        AwsModule,
        TypeOrmModule.forFeature([
            Asset,
            AssetAttachment,
            AssetCategory,
            AssetLocation,
            Department,
            Member,
        ]),
    ],
    controllers: [AssetsController, AssetCategoriesController, AssetLocationsController],
    providers: [AssetsService, AssetCategoryService, AssetLocationService],
    exports: [AssetsService, AssetCategoryService, AssetLocationService],
})
export class AssetsModule {}
