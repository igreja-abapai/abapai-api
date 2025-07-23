import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        private userService: UserService,
    ) {}

    async create(data: Partial<Notification>): Promise<Notification> {
        const notification = this.notificationRepository.create(data);
        return this.notificationRepository.save(notification);
    }

    async findAllForUser(userId: number): Promise<Notification[]> {
        return this.notificationRepository
            .createQueryBuilder('notification')
            .leftJoinAndSelect('notification.recipients', 'recipient')
            .leftJoinAndSelect('notification.readBy', 'readBy')
            .where('recipient.id = :userId', { userId })
            .orderBy('notification.createdAt', 'DESC')
            .getMany();
    }

    async markAsRead(notificationId: number, userId: number): Promise<void> {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId },
            relations: ['readBy'],
        });
        const user = await this.userService.findOne(userId);
        if (notification && user && !notification.readBy.some((u) => u.id === userId)) {
            notification.readBy.push(user);
            await this.notificationRepository.save(notification);
        }
    }

    async sendNotification({
        title,
        message,
        type,
        data,
        recipientIds,
    }: {
        title: string;
        message: string;
        type?: string;
        data?: any;
        recipientIds: number[];
    }): Promise<Notification> {
        const recipients = await Promise.all(
            recipientIds.map((id) => this.userService.findOne(id)),
        );
        const notification = this.notificationRepository.create({
            title,
            message,
            type: type || 'info',
            data,
            recipients: recipients.filter((user) => user !== null),
            readBy: [],
        });
        return this.notificationRepository.save(notification);
    }
}
