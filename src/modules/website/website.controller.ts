import { Controller, Get, Put, Body } from '@nestjs/common';
import { WebsiteService } from './website.service';
import { UpdateWebsiteSettingsDto } from './dto/update-website-settings.dto';

@Controller('website')
// @UseGuards(AuthGuard('jwt'))
export class WebsiteController {
    constructor(private readonly websiteService: WebsiteService) {}

    @Get('settings')
    async getSettings() {
        return await this.websiteService.getSettings();
    }

    @Put('settings')
    async updateSettings(@Body() updateDto: UpdateWebsiteSettingsDto) {
        return await this.websiteService.updateSettings(updateDto);
    }
}
