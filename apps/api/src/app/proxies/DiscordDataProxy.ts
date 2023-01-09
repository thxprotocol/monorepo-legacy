import type { IAccount } from '@thxnetwork/api/models/Account';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { THXError } from '@thxnetwork/api/util/errors';

class NoDataError extends THXError {
    message = 'Could not find discord data for this account';
}

export default class DiscordDataProxy {
    static async get(sub: string) {
        const r = await authClient({
            method: 'GET',
            url: `/account/${sub}/discord`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (r.status !== 200) throw new NoDataError();
        if (!r.data) throw new NoDataError();

        return { isAuthorized: r.data.isAuthorized, guilds: r.data.guilds };
    }
    static async validateGuildJoined(account: IAccount, channelItem: string) {
        const { data } = await authClient({
            method: 'GET',
            url: `/account/${account.sub}/discord/guild/${channelItem}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (!data) throw new NoDataError();

        return data.result;
    }
}
