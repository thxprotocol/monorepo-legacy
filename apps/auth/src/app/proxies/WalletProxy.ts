import { apiClient, getAuthAccessToken } from '../util/api';

export default {
    get: async (poolId: string) => {
        const r = await apiClient({
            method: 'GET',
            url: '/v1/wallets',
            headers: {
                'X-PoolId': poolId,
                'Authorization': await getAuthAccessToken(),
            },
        });
        return r.data;
    },

    create: async (poolId: string) => {
        const r = await apiClient({
            method: 'POST',
            url: `/v1/wallets`,
            headers: {
                'X-PoolId': poolId,
                'Authorization': await getAuthAccessToken(),
            },
        });
        return r.data;
    },
};
