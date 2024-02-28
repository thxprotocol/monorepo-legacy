import mongoose from 'mongoose';

export type NotificationDocument = mongoose.Document & TNotification;

export const Notification = mongoose.model<NotificationDocument>(
    'Notifications',
    new mongoose.Schema(
        {
            sub: String,
            subjectId: String,
            poolId: String,
            subject: String,
            message: String,
        },
        { timestamps: true },
    ),
    'notification',
);
