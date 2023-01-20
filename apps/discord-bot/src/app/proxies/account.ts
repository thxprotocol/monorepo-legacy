import { authClient, getAuthAccessToken } from '../utils/auth';

class NoAccountError extends Error {
    message = 'Could not find an account for this address';
}

export default {
    async get(id: string) {
        const r = await authClient({
            method: 'GET',
            url: `/account/discord/${id}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (!r.data) {
            throw new NoAccountError();
        }

        return r.data;
    },
};
