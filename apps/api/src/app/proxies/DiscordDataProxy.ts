import axios from 'axios';
import type { TAccount, TBrand, TPool, TQuest, TQuestEmbed, TWidget } from '@thxnetwork/types/interfaces';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { THXError } from '@thxnetwork/api/util/errors';
import { format } from 'date-fns';
import { QuestVariant } from '@thxnetwork/common/lib/types';

class NoDataError extends THXError {
    message = 'Could not find discord data for this account';
}

export enum NotificationVariant {
    QuestDaily = 0,
    QuestInvite = 1,
    QuestYouTube = 3,
    QuestTwitter = 4,
    QuestDiscord = 5,
    QuestCustom = 6,
    QuestWeb3 = 7,
}

export default class DiscordDataProxy {
    static async sendChannelMessage(webhookUrl: string, content: string, embeds: TQuestEmbed[] = []) {
        if (!webhookUrl) return;
        await axios.post(webhookUrl, { content, embeds });
    }

    static createEmbedQuest(variant: QuestVariant, quest: TQuest, pool: TPool, widget: TWidget, brand?: TBrand) {
        const theme = JSON.parse(widget.theme);
        const { amount, amounts } = quest as any;

        return {
            title: quest.title,
            description: quest.description,
            author: {
                name: pool.settings.title,
                icon_url: brand && brand.logoImgUrl,
                url: widget.domain,
            },
            thumbnail: { url: quest.image },
            footer: {
                text: `THX Network • ${format(new Date(), 'cccc MMM d - HH:mm')}`,
                icon_url: 'https://auth.thx.network/img/logo.png',
            },
            color: parseInt(theme.elements.btnBg.color.replace(/^#/, ''), 16),
            fields: [
                {
                    name: ' ',
                    value: `Points: **${amount || amounts[0]}** ✨`,
                    inline: true,
                },
                {
                    name: ' ',
                    value: `[Complete ${QuestVariant[variant]} Quest ▸](${widget.domain})`,
                    inline: true,
                },
            ],
        };
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
