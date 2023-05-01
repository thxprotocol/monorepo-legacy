import mongoose from 'mongoose';
import { TWidget } from '@thxnetwork/types/interfaces/Widget';

export type WidgetDocument = mongoose.Document & TWidget;

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
