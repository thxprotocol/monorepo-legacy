import mongoose from 'mongoose';

export type TBrandUpdate = Partial<TBrand>;

export const Brand = mongoose.model<TBrand>(
    'Brand',
    new mongoose.Schema({
        poolId: String,
        previewImgUrl: String,
        logoImgUrl: String,
        backgroundImgUrl: String,
        widgetPreviewImgUrl: String,
    }),
    'brand',
);
