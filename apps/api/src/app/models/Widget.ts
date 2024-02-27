import mongoose from 'mongoose';

export type WidgetDocument = mongoose.Document & TWidget;

const widgetSchema = new mongoose.Schema(
    {
        uuid: String,
        poolId: String,
        iconImg: String,
        align: String,
        message: String,
        domain: String,
        theme: String,
        cssSelector: String,
        active: { default: false, type: Boolean },
        isPublished: { type: Boolean, default: true },
    },
    { timestamps: true },
);

export const Widget = mongoose.model<WidgetDocument>('Widget', widgetSchema, 'widgets');
