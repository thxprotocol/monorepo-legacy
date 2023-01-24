import type { IAccount, IAccountUpdates } from '@thxnetwork/api/models/Account';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { THXError } from '@thxnetwork/api/util/errors';
import { Wallet } from '../models/Wallet';
import { ChainId } from '../types/enums';

class NoAccountError extends THXError {
    message = 'Could not find an account for this address';
}

class AccountApiError extends THXError {}

async function authAccountRequest(url: string) {
    const { data } = await authClient({
        method: 'GET',
        url,
        headers: {
            Authorization: await getAuthAccessToken(),
        },
    });

    if (!data) throw new NoAccountError();

    data.getAddress = async (chainId: ChainId) => {
        if (data.variant === 4) return data.address;
        const wallet = await Wallet.findOne({ sub: data.sub, chainId });
        if (!wallet) return;

        return wallet.address;
    };

    return data;
}

export default class AccountProxy {
    static async getById(sub: string): Promise<IAccount> {
        return await authAccountRequest(`/account/${sub}`);
    }

    static async getByEmail(email: string) {
        return await authAccountRequest(`/account/email/${email}`);
    }

    static async getByAddress(address: string): Promise<IAccount> {
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
}
