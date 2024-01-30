import { TAccount } from '@thxnetwork/types/interfaces';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { BadRequestError } from '../util/errors';

async function authAccountRequest(url: string) {
    const { data } = await authClient({
        method: 'GET',
        url,
        headers: {
            Authorization: await getAuthAccessToken(),
        },
    });
    console.log(data.tokens);
    return data;
}

export default class AccountProxy {
    static findById(sub: string): Promise<TAccount> {
        return authAccountRequest(`/account/${sub}`);
    }

    static async update(sub: string, updates: TAccount): Promise<TAccount> {
        const { status, data } = await authClient({
            method: 'PATCH',
            url: `/account/${sub}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
            data: updates,
        });

        if (status >= 400 && status <= 500) {
            throw new BadRequestError(data.error.message);
        }

        return data;
    }

    static async remove(sub: string) {
        await authClient({
            method: 'DELETE',
            url: `/account/${sub}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });
    }

    static async find({ subs }: { subs: string[] }): Promise<TAccount[]> {
        if (!subs.length) return [];

        const params = new URLSearchParams();
        params.append('subs', subs.join(','));
        const { data } = await authClient({
            method: 'GET',
            url: '/account',
            headers: {
                Authorization: await getAuthAccessToken(),
            },
            params,
        });

        return data;
    }

    static getByDiscordId(discordId: string): Promise<TAccount> {
        return authAccountRequest(`/account/discord/${discordId}`);
    }

    static getByEmail(email: string): Promise<TAccount> {
        return authAccountRequest(`/account/email/${email}`);
    }

    static getByAddress(address: string): Promise<TAccount> {
        return authAccountRequest(`/account/address/${address}`);
    }

    static async isEmailDuplicate(email: string) {
        try {
            await authClient({
                method: 'GET',
                url: `/account/email/${email}`,
                headers: {
                    Authorization: await getAuthAccessToken(),
                },
            });

            return true;
        } catch (error) {
            if (error.response.status === 404) {
                return false;
            }
            throw error;
        }
    }
}
