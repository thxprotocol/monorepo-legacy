import mongoose from 'mongoose';

export type NotificationDocument = mongoose.Document & TNotification;

const schema = new mongoose.Schema(
    {
        sub: String,
        subjectId: String,
        poolId: String,
        subject: String,
        message: String,
    },
    { timestamps: true },
);

export const Notification = mongoose.model<NotificationDocument>('Notifications', schema, 'notifications');
