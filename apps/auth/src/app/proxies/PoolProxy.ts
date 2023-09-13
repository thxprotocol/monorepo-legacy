import { AccountDocument } from '../models/Account';
import { apiClient } from '../util/api';

export default {
    transferOwnership: async (account: AccountDocument, poolId: string, token: string) => {
        const { data } = await apiClient({
            method: 'POST',
            url: `/v1/pools/${poolId}/transfers`,
            data: { token, sub: String(account._id) },
        });
        return data;
    },

    getPool: async (poolId: string) => {
        const { data } = await apiClient({
            method: 'GET',
            url: `/v1/pools/${poolId}`,
        });
        return data;
    },
};
