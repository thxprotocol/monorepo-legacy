type TRewardDiscordRole = TReward & {
    discordRoleId: string;
};

type TRewardDiscordRolePayment = TRewardPayment & {
    discordRoleId: string;
    role: { color: string; name: string };
};
