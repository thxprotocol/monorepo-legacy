import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { BadRequestError } from '../util/errors';
import { AccessTokenKind, OAuthScope } from '@thxnetwork/common/enums';
import { AxiosRequestConfig } from 'axios';

export default class AccountProxy {
    static async request(config: AxiosRequestConfig) {
        const { status, data } = await authClient({
            ...config,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (status >= 400 && status <= 500 && data.error) {
            throw new BadRequestError(data.error.message);
        }

        return data;
    }

    static async getToken(account: TAccount, kind: AccessTokenKind, requiredScopes: OAuthScope[] = []) {
        const token = await this.request({
            method: 'GET',
            url: `/accounts/${account.sub}/tokens/${kind}`,
        });
        if (token && requiredScopes.every((scope) => token.scopes.includes(scope))) return token;
    }

    static disconnect(account: TAccount, kind: AccessTokenKind) {
        return this.request({
            method: 'DELETE',
            url: `/accounts/${account.sub}/tokens/${kind}`,
        });
    }

    static findById(sub: string): Promise<TAccount> {
        return this.request({
            method: 'GET',
            url: `/accounts/${sub}`,
        });
    }

    static update(sub: string, updates: Partial<TAccount>): Promise<TAccount> {
        return this.request({
            method: 'PATCH',
            url: `/accounts/${sub}`,
            data: updates,
        });
    }

    static remove(sub: string) {
        return this.request({
            method: 'DELETE',
            url: `/accounts/${sub}`,
        });
    }

    static find({ subs, query }: Partial<{ subs: string[]; query: string }>): Promise<TAccount[]> {
        return this.request({
            method: 'POST',
            url: '/accounts',
            data: { subs: JSON.stringify(subs), query },
        });
    }

    static getByDiscordId(discordId: string): Promise<TAccount> {
        return this.request({
            method: 'GET',
            url: `/accounts/discord/${discordId}`,
        });
    }

    static getByEmail(email: string): Promise<TAccount> {
        return this.request({
            method: 'GET',
            url: `/accounts/email/${email}`,
        });
    }

    static getByAddress(address: string): Promise<TAccount> {
        return this.request({
            method: 'GET',
            url: `/accounts/address/${address}`,
        });
    }

    static getByIdentity(identity: string): Promise<TAccount> {
        return this.request({
            method: 'GET',
            url: `/accounts/identity/${identity}`,
        });
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
