import mongoose from 'mongoose';
import { TBrand } from '@thxnetwork/types/interfaces';

export type TBrandUpdate = Partial<TBrand>;

const brandSchema = new mongoose.Schema({
    logoImgUrl: String,
    backgroundImgUrl: String,
    poolId: String,
});

export default mongoose.model<TBrand>('brand', brandSchema);
