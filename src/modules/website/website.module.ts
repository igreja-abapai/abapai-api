import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebsiteSettings } from './entities/website-settings.entity';
import { WebsiteService } from './website.service';
import { WebsiteController } from './website.controller';

@Module({
    imports: [TypeOrmModule.forFeature([WebsiteSettings])],
    controllers: [WebsiteController],
    providers: [WebsiteService],
    exports: [WebsiteService],
})
export class WebsiteModule {}
