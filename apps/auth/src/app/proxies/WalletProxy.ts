import { apiClient, getAuthAccessToken } from '../util/api';
import { ChainId } from '../types/enums/chainId';

export default {
    get: async (sub: string, chainId: ChainId, address?: string) => {
        const params = new URLSearchParams();
        params.set('chainId', String(chainId));
        params.set('sub', String(sub));
        params.set('address', address);

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

    create: async (data: {
        chainId: ChainId;
        sub: string;
        skipDeploy?: boolean;
        forceSync?: boolean;
        address?: string;
    }) => {
        const r = await apiClient({
            method: 'POST',
            url: `/v1/wallets`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
            data: data,
        });
        return r.data;
    },
};
