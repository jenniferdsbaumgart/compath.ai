import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(notification: Partial<Notification>): Promise<NotificationDocument> {
    const createdNotification = new this.notificationModel(notification);
    return createdNotification.save();
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();
  }

  async findUnreadByUserId(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ userId, read: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(notificationId: string, userId: string): Promise<NotificationDocument | null> {
    return this.notificationModel
      .findOneAndUpdate(
        { _id: notificationId, userId },
        { read: true },
        { new: true },
      )
      .exec();
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return this.notificationModel
      .countDocuments({ userId, read: false })
      .exec();
  }

  async deleteExpired(): Promise<number> {
    const result = await this.notificationModel
      .deleteMany({ expiresAt: { $lt: new Date() } })
      .exec();
    return result.deletedCount;
  }
}
