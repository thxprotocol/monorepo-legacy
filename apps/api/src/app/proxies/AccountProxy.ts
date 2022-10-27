import type { IAccount, IAccountUpdates } from '@thxnetwork/api/models/Account';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { THXError } from '@thxnetwork/api/util/errors';

class NoAccountError extends THXError {
    message = 'Could not find an account for this address';
}
class CreateAccountError extends THXError {
    message = 'Could not signup for an account';
}
class AccountApiError extends THXError {}

export default class AccountProxy {
    static async getById(sub: string) {
        const r = await authClient({
            method: 'GET',
            url: `/account/${sub}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (!r.data) {
            throw new NoAccountError();
        }

        return r.data;
    }

    static async getByEmail(email: string) {
        const { data } = await authClient({
            method: 'GET',
            url: `/account/email/${email}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });
        if (!data) throw new NoAccountError();
        return data;
    }

    static async getByAddress(address: string): Promise<IAccount> {
        const { data } = await authClient({
            method: 'GET',
            url: `/account/address/${address}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });
        if (!data) throw new NoAccountError();
        return data;
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

    static async update(sub: string, updates: IAccountUpdates) {
        const { status } = await authClient({
            method: 'PATCH',
            url: `/account/${sub}`,
            data: updates,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (status === 422) throw new AccountApiError('A user for this e-mail already exists.');
        if (status !== 204) throw new AccountApiError('Could not update the account');
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

    static async signupFor(email: string, password: string, address?: string) {
        const r = await authClient({
            method: 'POST',
            url: '/account',
            data: {
                email,
                password,
                address,
            },
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (!r.data) {
            throw new CreateAccountError();
        }

        return r.data;
    }
}
