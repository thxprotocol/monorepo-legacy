import axios from 'axios';
import type {
    TAccount,
    TBrand,
    TDiscordButton,
    TDiscordEmbed,
    TPool,
    TQuest,
    TWidget,
} from '@thxnetwork/types/interfaces';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { THXError } from '@thxnetwork/api/util/errors';
import { QuestVariant } from '@thxnetwork/common/lib/types';
import { client } from '../../discord';
import { AssetPoolDocument } from '../models/AssetPool';
import { ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { WIDGET_URL } from '../config/secrets';
import DiscordGuild from '../models/DiscordGuild';

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
    static async sendChannelMessage(
        pool: AssetPoolDocument,
        content: string,
        embeds: TDiscordEmbed[] = [],
        buttons?: TDiscordButton[],
    ) {
        const discordGuild = await DiscordGuild.findOne({ poolId: String(pool._id) });
        const url = WIDGET_URL + `/c/${pool.settings.slug}/quests`;

        if (discordGuild) {
            const channel: any = await client.channels.fetch(discordGuild.channelId);
            const components = [];
            if (buttons) components.push(this.createButtonActionRow(buttons));

            channel.send({ content, embeds, components });
        } else if (pool.settings.discordWebhookUrl) {
            // Extending the content with a link as we're not allowed to send button components over webhooks
            content += `[Complete Quest ▸](<${url}>)`;
            axios.post(pool.settings.discordWebhookUrl, { content, embeds });
        }
    }

    static createEmbed(variant: QuestVariant, quest: TQuest, pool: TPool, widget: TWidget, brand?: TBrand) {
        const theme = JSON.parse(widget.theme);
        const { amount, amounts } = quest as any;
        const color = parseInt(theme.elements.btnBg.color.replace(/^#/, ''), 16);
        return {
            title: quest.title,
            description: quest.description,
            author: {
                name: pool.settings.title,
                icon_url: brand && brand.logoImgUrl,
                url: widget.domain,
            },
            thumbnail: { url: quest.image },
            color,
            fields: [
                {
                    name: 'Points',
                    value: amount || amounts[0],
                    inline: true,
                },
                {
                    name: 'Type',
                    value: QuestVariant[variant],
                    inline: true,
                },
            ],
        };
    }

    static createButtonActionRow(buttons: TDiscordButton[]) {
        const components = buttons.map((btn: TDiscordButton) => {
            const button = new ButtonBuilder().setLabel(btn.label).setStyle(btn.style);
            if (btn.customId) button.setCustomId(btn.customId);
            if (btn.url) button.setURL(btn.url);
            return button;
        });
        return new ActionRowBuilder().addComponents(components);
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
