export type TDiscordGuild = {
    sub: string;
    poolId: string;
    guildId: string;
    name: string;
    roles: TDiscordRole[];
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
