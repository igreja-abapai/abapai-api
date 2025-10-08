import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebsiteSettings } from './entities/website-settings.entity';
import { UpdateWebsiteSettingsDto } from './dto/update-website-settings.dto';

@Injectable()
export class WebsiteService {
    constructor(
        @InjectRepository(WebsiteSettings)
        private websiteSettingsRepository: Repository<WebsiteSettings>,
    ) {}

    async getSettings(): Promise<WebsiteSettings> {
        const settings = await this.websiteSettingsRepository.findOne({
            where: { id: 1 },
        });

        return settings;
    }

    async updateSettings(updateDto: UpdateWebsiteSettingsDto): Promise<WebsiteSettings> {
        let settings = await this.websiteSettingsRepository.findOne({
            where: { id: 1 },
        });

        if (!settings) {
            settings = this.websiteSettingsRepository.create({
                id: 1,
                ...updateDto,
            });
        } else {
            Object.assign(settings, updateDto);
        }

        return await this.websiteSettingsRepository.save(settings);
    }
}
