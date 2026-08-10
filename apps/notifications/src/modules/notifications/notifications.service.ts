import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../infrastructure/prisma';

interface GetUserNotificationsParams {
  userId: string;
  take: number;
  skip: number;
}

interface GetUserUnreadNotificationsCountParams {
  userId: string;
}

interface MarkUserNotificationsAsReadParams {
  userId: string;
  ids?: string[];
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserNotifications(params: GetUserNotificationsParams) {
    const notifications = await this.prismaService.notifications.findMany({
      where: {
        userId: params.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: params.take,
      skip: params.skip,
    });

    // TODO: cache value and delete this cache after any event with this userId
    const amountNotifications = await this.prismaService.notifications.count({
      where: {
        userId: params.userId,
      }
    });

    return {
      notifications,
      total: amountNotifications,
      skip: params.skip,
      take: params.take,
    }
  }

  async getUnreadNotificationsCount(params: GetUserUnreadNotificationsCountParams) {
    const unreadNotificationsCount = await this.prismaService.notifications.count({
      where: {
        userId: params.userId,
        isRead: false,
      },
    });

    return unreadNotificationsCount;
  }

  public async getNotificationById(id: string) {
    const notification = await this.prismaService.notifications.findFirst({
      where: {
        id,
      },
    });

    if (!notification) {
      throw new BadRequestException(`Notification not found with id ${id}`)
    }

    return notification;
  }

  async markUserNotificationsAsRead(params: MarkUserNotificationsAsReadParams) {
    await this.prismaService.notifications.updateMany({
      where: {
        userId: params.userId,
        id: params.ids ? {
          in: params.ids,
        } : undefined,
      },
      data: {
        isRead: true,
      }
    });
  }
}