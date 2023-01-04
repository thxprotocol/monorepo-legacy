import { apiClient, getAuthAccessToken } from '../util/api';

export default {
    get: async (claimUuid: string) => {
        const r = await apiClient({
            method: 'GET',
            url: `/v1/claims/${claimUuid}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });
        console.log(r.data);
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
