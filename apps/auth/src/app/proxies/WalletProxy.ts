import { apiClient, getAuthAccessToken } from '../util/api';
import { ChainId } from '../types/enums/chainId';

export default {
    get: async (sub: string, chainId: ChainId) => {
        const params = new URLSearchParams();
        params.set('chainId', String(chainId));
        params.set('sub', String(sub));

        const r = await apiClient({
            method: 'GET',
            url: '/v1/wallets',
            headers: {
                Authorization: await getAuthAccessToken(),
            },
            params,
        });
        return r.data;
    },

    create: async (sub: string, chainId: ChainId, forceSync = true) => {
        const r = await apiClient({
            method: 'POST',
            url: `/v1/wallets`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
            data: { sub, chainId, forceSync },
        });
        return r.data;
    },
};
