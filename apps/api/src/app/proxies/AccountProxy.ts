import { TAccount } from '@thxnetwork/types/interfaces';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { BadRequestError } from '../util/errors';
import { AccessTokenKind } from '@thxnetwork/common/lib/types/enums';

async function authAccountRequest(url: string) {
    const { data } = await authClient({
        method: 'GET',
        url,
        headers: {
            Authorization: await getAuthAccessToken(),
        },
    });
    return data;
}

export default class AccountProxy {
    static async disconnect(account: TAccount, kind: AccessTokenKind) {
        await authClient({
            method: 'POST',
            url: `/accounts/${account.sub}/disconnect`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
            data: { kind },
        });
    }

    static findById(sub: string): Promise<TAccount> {
        return authAccountRequest(`/accounts/${sub}`);
    }

    static async update(sub: string, updates: TAccount): Promise<TAccount> {
        const { status, data } = await authClient({
            method: 'PATCH',
            url: `/accounts/${sub}`,
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
            url: `/accounts/${sub}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });
    }

    static async find({ subs }: { subs: string[] }): Promise<TAccount[]> {
        const { data } = await authClient({
            method: 'POST',
            url: '/accounts',
            headers: {
                Authorization: await getAuthAccessToken(),
            },
            data: { subs: JSON.stringify(subs) },
        });
        return data;
    }

    static getByDiscordId(discordId: string): Promise<TAccount> {
        return authAccountRequest(`/accounts/discord/${discordId}`);
    }

    static getByEmail(email: string): Promise<TAccount> {
        return authAccountRequest(`/accounts/email/${email}`);
    }

    static getByAddress(address: string): Promise<TAccount> {
        return authAccountRequest(`/accounts/address/${address}`);
    }

    static async isEmailDuplicate(email: string) {
        try {
            await authClient({
                method: 'GET',
                url: `/accounts/email/${email}`,
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
