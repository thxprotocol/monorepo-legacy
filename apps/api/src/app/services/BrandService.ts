import { Brand } from '@thxnetwork/api/models/Brand';

export default {
    get: async (poolId: string) => {
        return Brand.findOne({ poolId });
    },
    update: async (filter: Partial<TBrand>, updates: Partial<TBrand>) => {
        return Brand.findOneAndUpdate(filter, updates, { upsert: true, new: true });
    },
};
