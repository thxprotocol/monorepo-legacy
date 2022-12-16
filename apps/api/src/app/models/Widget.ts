import mongoose from 'mongoose';

export type WidgetDocument = mongoose.Document & {
    uuid: string;
    poolId: string;
    color: string;
    bgColor: string;
};

const widgetSchema = new mongoose.Schema(
    {
        uuid: String,
        poolId: String,
        color: String,
        bgColor: String,
    },
    { timestamps: true },
);

export const Widget = mongoose.model<WidgetDocument>('Widget', widgetSchema, 'widgets');
