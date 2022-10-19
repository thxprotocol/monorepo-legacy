import { apiClient, getAuthAccessToken } from '../util/api';
import { ChainId } from '../util/chainId';

export default {
    get: async (query: { sub?: string }, page = 1, limit = 10) => {
        const r = await apiClient({
            method: 'GET',
            url: '/v1/wallets',
            headers: {
                Authorization: await getAuthAccessToken(),
            },
            data: { query, page, limit },
        });
        return r.data;
    },

    create: async (sub: string, chainId: ChainId) => {
        const r = await apiClient({
            method: 'POST',
            url: `/v1/wallets`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
            data: { sub, chainId },
        });
        return r.data;
    },
};
