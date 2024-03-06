import { apiClient, getAuthAccessToken } from '../util/api';

export default {
    get: async (uuid: string) => {
        const { data } = await apiClient({
            method: 'GET',
            url: `/v1/qr-codes/${uuid}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });
        return data;
    },
};
