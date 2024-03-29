type TDiscordGuild = {
    _id: string;
    id: string;
    sub: string;
    poolId: string;
    guildId: string;
    channelId: string;
    adminRoleId: string;
    name: string;
    roles: TDiscordRole[];
    channels: TDiscordChannel[];
    isInvited: boolean;
    isConnected: boolean;
    secret: string;
    isShownSecret: boolean;
    icon: string;
    permissions: any;
};

type TDiscordChannel = {
    channelId: string;
    name: string;
};

type TDiscordReaction = {
    guildId: string;
    messageId: string;
    memberId: string;
    content: string;
};

type TDiscordMessage = {
    guildId: string;
    messageId: string;
    memberId: string;
};

type TDiscordRole = {
    id: string;
    name: string;
    color: string;
    host: boolean;
};

type TDiscordButton = {
    label: string;
    style: ButtonStyle;
    emoji?: string;
    customId?: string;
    url?: string;
    disabled?: boolean;
};

type TDiscordUser = {
    userId: string;
    guildId: string;
    profileImgUrl: string;
    username: string;
    publicMetrics: {
        joinedAt: Date;
        reactionCount: number;
        messageCount: number;
    };
};

type TDiscordEmbed = {
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
