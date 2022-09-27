import { apiClient, getAuthAccessToken } from '../util/api';

export default {
    get: async (claimId: string) => {
        const r = await apiClient({
            method: 'GET',
            url: `/v1/claims/${claimId}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });
        return r.data;
    },

    getByHash: async (hash: string) => {
        const r = await apiClient({
            method: 'GET',
            url: `/v1/claims/hash/${hash}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });
        return r.data;
    },
};
