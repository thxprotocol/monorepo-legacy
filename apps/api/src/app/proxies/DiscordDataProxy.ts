import type { TAccount, TPoolSettings, TPoolTransfer } from '@thxnetwork/types/interfaces';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { THXError } from '@thxnetwork/api/util/errors';
import axios from 'axios';

class NoDataError extends THXError {
    message = 'Could not find discord data for this account';
}

export default class DiscordDataProxy {
    static async sendChannelMessage(
        settings: TPoolSettings,
        message: {
            title: string;
            description: string;
            url: string;
        },
    ) {
        if (!settings.discordWebhookUrl) return;

        await axios.post(settings.discordWebhookUrl, {
            content: '@here ' + settings.defaults.discordMessage,
            embeds: [message],
        });
    }

    static async getUserId(account: TAccount) {
        const { data } = await authClient({
            method: 'GET',
            url: `/account/${account.sub}/discord/user`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });
        return data.userId;
    }
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
    static async validateGuildJoined(account: TAccount, channelItem: string) {
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
