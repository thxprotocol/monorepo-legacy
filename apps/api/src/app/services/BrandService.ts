import BrandModel, { TBrandUpdate } from '@thxnetwork/api/models/Brand';
import { TBrand } from '@thxnetwork/types/interfaces';

type FindOptions = Partial<Pick<TBrand, 'poolId'>>;

export default {
    get: async (poolId: string) => {
        return BrandModel.findOne({ poolId });
    },
    update: async (options: FindOptions, updates: TBrandUpdate) => {
        return BrandModel.findOneAndUpdate(options, updates, { upsert: true, new: true });
    },
};
