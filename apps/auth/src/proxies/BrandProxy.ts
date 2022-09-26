import { apiClient } from '../util/api';

export default {
    get: async (poolId: string) => {
        const r = await apiClient({
            method: 'GET',
            url: '/v1/brands',
            headers: {
                'X-PoolId': poolId,
            },
        });

        return r.data;
    },
};
