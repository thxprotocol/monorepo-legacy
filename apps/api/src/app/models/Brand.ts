import mongoose from 'mongoose';
import { TBrand } from '@thxnetwork/types/interfaces';

export type TBrandUpdate = Partial<TBrand>;

const brandSchema = new mongoose.Schema({
    poolId: String,
    previewImgUrl: String,
    logoImgUrl: String,
    backgroundImgUrl: String,
    widgetPreviewImgUrl: String,
});

export default mongoose.model<TBrand>('brand', brandSchema);
