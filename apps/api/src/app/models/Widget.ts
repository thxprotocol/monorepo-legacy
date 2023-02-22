import mongoose from 'mongoose';

export type WidgetDocument = mongoose.Document & {
    uuid: string;
    poolId: string;
    align: string;
    message: string;
    domain: string;
    color: string;
    bgColor: string;
    theme: string;
};

const widgetSchema = new mongoose.Schema(
    {
        uuid: String,
        poolId: String,
        align: String,
        message: String,
        domain: String,
        color: String,
        bgColor: String,
        theme: String,
    },
    { timestamps: true },
);

export const Widget = mongoose.model<WidgetDocument>('Widget', widgetSchema, 'widgets');
