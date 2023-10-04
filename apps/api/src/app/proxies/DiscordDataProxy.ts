import type { TAccount } from '@thxnetwork/types/interfaces';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { THXError } from '@thxnetwork/api/util/errors';
import { format } from 'date-fns';
import axios from 'axios';

class NoDataError extends THXError {
    message = 'Could not find discord data for this account';
}

export enum NotificationVariant {
    QuestDaily = 0,
    QuestInvite = 1,
    QuestYouTube = 2,
    QuestTwitter = 3,
    QuestDiscord = 4,
    QuestCustom = 5,
    QuestWeb3 = 6,
}

export const notificationVariantMap = {
    [NotificationVariant.QuestDaily]: {
        actionLabel: 'Complete Quest',
        content: 'just published a quest',
        questVariant: 'Daily Quest',
    },
    [NotificationVariant.QuestInvite]: {
        actionLabel: 'Complete Invite Quest',
        content: 'just published a Invite quest',
        questVariant: 'Invite Quest',
    },
    [NotificationVariant.QuestTwitter]: {
        actionLabel: 'Complete Quest',
        content: 'just published a quest',
        questVariant: 'Twitter Quest',
    },
    [NotificationVariant.QuestDiscord]: {
        actionLabel: 'Complete Discord Quest',
        content: 'just published a Discord quest',
        questVariant: 'Discord Quest',
    },
    [NotificationVariant.QuestYouTube]: {
        actionLabel: 'Complete YouTube Quest',
        content: 'just published a YouTube quest',
        questVariant: 'YouTube Quest',
    },
    [NotificationVariant.QuestCustom]: {
        actionLabel: 'Complete Custom Quest',
        content: 'just published a custom quest',
        questVariant: 'Custom Quest',
    },
    [NotificationVariant.QuestWeb3]: {
        actionLabel: 'Complete Web3 Quest',
        content: 'just published a web3 quest',
        questVariant: 'Web3 Quest',
    },
};

export default class DiscordDataProxy {
    static async sendChannelMessage(
        variant: NotificationVariant,
        settings: {
            title: string;
            description: string;
            logoImgUrl: string;
            backgroundImgUrl: string;
            discordWebhookUrl: string;
            defaults: { discordMessage: string };
            domain: string;
            theme: string;
        },
        message: {
            image: string;
            title: string;
            description: string;
        },
    ) {
        if (!settings.discordWebhookUrl) return;

        const { content, questVariant } = notificationVariantMap[variant];
        const theme = JSON.parse(settings.theme);

        await axios.post(settings.discordWebhookUrl, {
            content: `Hi all! **${settings.title}** ${content}.`,
            embeds: [
                {
                    title: `${questVariant}: ${message.title}`,
                    description: message.description,
                    url: settings.domain,
                    author: {
                        name: settings.title,
                        icon_url: settings.logoImgUrl,
                        url: settings.domain,
                    },
                    thumbnail: { url: message.image },
                    footer: {
                        text: `THX Network • ${format(new Date(), 'cccc MMM d - HH:mm')}`,
                        icon_url: 'https://auth.thx.network/img/logo.png',
                    },
                    color: parseInt(theme.elements.btnBg.color.replace(/^#/, ''), 16),
                },
            ],
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
