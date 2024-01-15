import { ButtonStyle } from 'discord.js';

export type TDiscordGuild = {
    _id: string;
    sub: string;
    poolId: string;
    guildId: string;
    channelId: string;
    adminRoleId: string;
    name: string;
    roles: TDiscordRole[];
    channels: TDiscordChannel[];
    isInstalled: boolean;
    secret: string;
    isShownSecret: boolean;
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
    emoji?: string;
    customId?: string;
    url?: string;
    disabled?: boolean;
};

export type TDiscordEmbed = {
    title: string;
    description: string;
    author: {
        name: string;
        icon_url: string;
        url: string;
    };
    image: { url: string };
    color: number;
    fields: {
        name: string;
        value: string;
        inline?: boolean;
    }[];
};
