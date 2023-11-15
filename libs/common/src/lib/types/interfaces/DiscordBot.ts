export type TDiscordGuild = {
    sub: string;
    poolId: string;
    guildId: string;
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
