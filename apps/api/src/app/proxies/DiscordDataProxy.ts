import axios, { AxiosRequestConfig } from 'axios';
import type { TAccount, TDiscordButton, TDiscordEmbed } from '@thxnetwork/types/interfaces';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { client, PermissionFlagsBits } from '../../discord';
import { AssetPoolDocument } from '../models/AssetPool';
import { ActionRowBuilder, ButtonBuilder, Guild } from 'discord.js';
import { WIDGET_URL } from '../config/secrets';
import { logger } from '../util/logger';
import DiscordGuild, { DiscordGuildDocument } from '../models/DiscordGuild';
import { AccessTokenKind } from '@thxnetwork/common/lib/types/enums';
import { DISCORD_API_ENDPOINT } from '@thxnetwork/common/lib/types/contants';

export enum NotificationVariant {
    QuestDaily = 0,
    QuestInvite = 1,
    QuestYouTube = 3,
    QuestTwitter = 4,
    QuestDiscord = 5,
    QuestCustom = 6,
    QuestWeb3 = 7,
}

export async function discordClient(config: AxiosRequestConfig) {
    try {
        const client = axios.create({ ...config, baseURL: DISCORD_API_ENDPOINT });
        return await client(config);
    } catch (error) {
        console.error(error);
    }
}

export default class DiscordDataProxy {
    static async sendChannelMessage(
        pool: AssetPoolDocument,
        content: string,
        embeds: TDiscordEmbed[] = [],
        buttons?: TDiscordButton[],
    ) {
        try {
            const discordGuild = await DiscordGuild.findOne({ poolId: String(pool._id) });
            const url = WIDGET_URL + `/c/${pool.settings.slug}/quests`;

            if (discordGuild && discordGuild.channelId) {
                const channel: any = await client.channels.fetch(discordGuild.channelId);
                const components = [];
                if (buttons) components.push(this.createButtonActionRow(buttons));

                const botMember = channel.guild.members.cache.get(client.user.id);
                if (!botMember.permissionsIn(channel).has(PermissionFlagsBits.SendMessages)) {
                    throw new Error('Insufficient channel permissions for bot to send messages.');
                }

                channel.send({ content, embeds, components });
            } else if (pool.settings.discordWebhookUrl) {
                // Extending the content with a link as we're not allowed to send button components over webhooks
                content += ` [Complete Quest ▸](<${url}>)`;
                axios.post(pool.settings.discordWebhookUrl, { content, embeds });
            }
        } catch (error) {
            logger.error(error);
        }
    }

    static createButtonActionRow(buttons: TDiscordButton[]) {
        const components = buttons.map((btn: TDiscordButton) => {
            const button = new ButtonBuilder().setLabel(btn.label).setStyle(btn.style);
            if (btn.customId) button.setCustomId(btn.customId);
            if (btn.url) button.setURL(btn.url);
            if (btn.emoji) button.setEmoji(btn.emoji);
            if (btn.disabled) button.setDisabled(true);
            return button;
        });
        return new ActionRowBuilder().addComponents(components);
    }

    static async getUserId(account: TAccount) {
        const { accessToken } = account.tokens.find((token) => token.kind === AccessTokenKind.Discord);
        const { data } = await discordClient({
            url: '/oauth2/@me',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        return data.user.id;
    }

    static async getGuilds(accessToken: string) {
        const r = await discordClient({
            method: 'GET',
            url: '/users/@me/guilds',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        return r.data;
    }

    static async get(sub: string) {
        const r = await authClient({
            method: 'GET',
            url: `/account/${sub}/discord`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        return { isAuthorized: r.data.isAuthorized, guilds: r.data.guilds };
    }

    static async validateGuildJoined(account: TAccount, guildId: string) {
        const token = account.tokens.find(({ kind }) => kind === AccessTokenKind.Discord);
        const guilds = await this.getGuilds(token.accessToken);
        const isUserJoinedGuild = guilds.find((guild) => guild.id === guildId);
        if (isUserJoinedGuild) return { result: true };
        return { result: false, reason: 'Discord: Your Discord account is not a member of this server.' };
    }

    static discordColorToHex(discordColorCode) {
        return `#${discordColorCode.toString(16).padStart(6, '0')}`;
    }

    static async getGuildRoles(guild: Guild) {
        return guild.roles.cache.map((role) => ({
            id: role.id,
            name: role.name,
            color: this.discordColorToHex(role.color),
        }));
    }

    static async getGuildChannels(guild: Guild) {
        const channels = await guild.channels.fetch();
        return channels.map((c) => ({ name: c.name, channelId: c.id }));
    }

    static async fetchGuild(guildId: string) {
        try {
            return await client.guilds.fetch(guildId);
        } catch (error) {
            return;
        }
    }

    static async getGuild(guild: DiscordGuildDocument) {
        const botGuild = await this.fetchGuild(guild.guildId);
        const roles = botGuild ? await this.getGuildRoles(botGuild) : [];
        const channels = botGuild ? await this.getGuildChannels(botGuild) : [];

        return {
            ...guild,
            roles,
            channels,
            isInvited: !!botGuild,
        };
    }
}
