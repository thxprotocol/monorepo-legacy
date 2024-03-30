type TQuestSocialEntry = {
    _id: string;
    questId: string;
    sub: string;
    amount: string;
    poolId: string;
    metadata: TQuestSocialEntryMetadata;
    createdAt: Date;
    account?: TAccount;
    wallet?: TWallet;
};

type TQuestSocialEntryMetadata = {
    platformUserId: string;
    twitter: TTwitterUserPublicMetrics;
    discord: { guildId: string; reactionCount: number; messageCount: number };
};
