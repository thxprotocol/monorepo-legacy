import { apiClient, getAuthAccessToken } from '../util/api';
import { ChainId } from '../types/enums/chainId';
import { TWallet } from '@thxnetwork/types/interfaces';

export default {
    get: async (sub: string, chainId: ChainId, address?: string) => {
        const params = new URLSearchParams();
        params.set('chainId', String(chainId));
        params.set('sub', String(sub));
        params.set('address', address);

        const r = await apiClient({
            method: 'GET',
            url: '/v1/wallets',
            headers: { Authorization: await getAuthAccessToken() },
            params,
        });

        return r.data;
    },

    update: async (data: TWallet) => {
        const r = await apiClient({
            method: 'PATCH',
            url: `/v1/wallets/${data._id}`,
            headers: { Authorization: await getAuthAccessToken() },
            data,
        });
        return r.data;
    },

    create: async (
        data: TWallet & {
            skipDeploy?: boolean;
            forceSync?: boolean;
        },
    ) => {
        const r = await apiClient({
            method: 'POST',
            url: `/v1/wallets`,
            headers: { Authorization: await getAuthAccessToken() },
            data,
        });
        return r.data;
    },
};
