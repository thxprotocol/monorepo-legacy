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
    active: boolean;
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
        active: { default: false, type: Boolean },
    },
    { timestamps: true },
);

export const Widget = mongoose.model<WidgetDocument>('Widget', widgetSchema, 'widgets');
