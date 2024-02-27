import mongoose from 'mongoose';

export type TBrandUpdate = Partial<TBrand>;

const brandSchema = new mongoose.Schema({
    poolId: String,
    previewImgUrl: String,
    logoImgUrl: String,
    backgroundImgUrl: String,
    widgetPreviewImgUrl: String,
});

export const Brand = mongoose.model<TBrand>('brand', brandSchema);
