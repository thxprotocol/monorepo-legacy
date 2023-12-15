import { TAccount } from '@thxnetwork/types/interfaces';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { THXError } from '@thxnetwork/api/util/errors';
import { logger } from '../util/logger';

class NoAccountError extends THXError {
    message = 'Could not find an account for this address';
}

class AccountApiError extends THXError {}

function formatAccountData(data: any) {
    data.profileImg = data.profileImg || `https://api.dicebear.com/7.x/identicon/svg?seed=${data.sub}`;
    return data;
}

async function authAccountRequest(url: string) {
    const { data } = await authClient({
        method: 'GET',
        url,
        headers: {
            Authorization: await getAuthAccessToken(),
        },
    });

    if (!data) throw new NoAccountError();

    return formatAccountData(data);
}

export default class AccountProxy {
    static async getById(sub: string): Promise<TAccount> {
        return await authAccountRequest(`/account/${sub}`);
    }

    static async getMany(subs: string[]): Promise<TAccount[]> {
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
        const accounts = data.map((x: any) => {
            return formatAccountData(x);
        });
        return accounts;
    }

    static async getByDiscordId(discordId: string): Promise<TAccount> {
        try {
            const { data } = await authClient({
                method: 'GET',
                url: `/account/discord/${discordId}`,
                headers: {
                    Authorization: await getAuthAccessToken(),
                },
            });
            return data;
        } catch (error) {
            logger.error(error);
        }
    }

    static async getByEmail(email: string) {
        return await authAccountRequest(`/account/email/${email}`);
    }

    static async getByAddress(address: string): Promise<TAccount> {
        return await authAccountRequest(`/account/address/${address}`);
    }

    static async isEmailDuplicate(email: string) {
        try {
            await authClient({
                method: 'GET',
                url: `/account/email/${email}`, // TODO Should only return active accounts
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

    static async update(sub: string, updates: TAccount) {
        const { data } = await authClient({
            method: 'PATCH',
            url: `/account/${sub}`,
            data: updates,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });
        return data;
    }

    static async remove(sub: string) {
        const r = await authClient({
            method: 'DELETE',
            url: `/account/${sub}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (!r.data) {
            throw new AccountApiError('Could not delete');
        }
    }
}
