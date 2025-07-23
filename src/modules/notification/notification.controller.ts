import { Controller, Get, Post, Body, Param, Request, UseGuards, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get('me')
    async getMyNotifications(@Request() req) {
        return this.notificationService.findAllForUser(req.user.id);
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string, @Request() req) {
        await this.notificationService.markAsRead(+id, req.user.id);
        return { success: true };
    }

    // Allow admins to send notifications
    @Post()
    async create(@Body() body) {
        return this.notificationService.sendNotification(body);
    }
}
