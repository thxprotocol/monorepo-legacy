import mongoose from 'mongoose';

export type TBrandUpdate = Partial<TBrand>;

export interface TBrand {
    logoImgUrl: string;
    backgroundImgUrl: string;
    poolId: string;
}

const brandSchema = new mongoose.Schema({
    logoImgUrl: String,
    backgroundImgUrl: String,
    poolId: String,
});

export default mongoose.model<TBrand>('brand', brandSchema);
