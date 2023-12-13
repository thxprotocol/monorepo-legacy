import { ButtonStyle } from 'discord.js';

export type TDiscordGuild = {
    sub: string;
    poolId: string;
    guildId: string;
    channelId: string;
    name: string;
    roles: TDiscordRole[];
    channels: TDiscordChannel[];
};

export type TDiscordChannel = {
    channelId: string;
    name: string;
};

export type TDiscordReaction = {
    guildId: string;
    messageId: string;
    memberId: string;
    content: string;
};

export type TDiscordMessage = {
    guildId: string;
    messageId: string;
    memberId: string;
};

export type TDiscordRole = {
    id: string;
    name: string;
    color: string;
    host: boolean;
};

export type TDiscordButton = {
    label: string;
    style: ButtonStyle;
    customId?: string;
    url?: string;
};

export type TDiscordEmbed = {
    title: string;
    description: string;
    author: {
        name: string;
        icon_url: string;
        url: string;
    };
    thumbnail: {
        url: string;
    };
    color: number;
    fields: {
        name: string;
        value: string;
        inline?: boolean;
    }[];
};
