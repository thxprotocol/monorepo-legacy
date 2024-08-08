type TQuestSocialEntry = TBaseQuestEntry & {
    account?: TAccount;
    wallet?: TWallet;
    metadata: TQuestSocialEntryMetadata;
};

type TQuestSocialEntryMetadata = {
    platformUserId: string;
    twitter: TTwitterUserPublicMetrics;
    discord: { guildId: string; reactionCount: number; messageCount: number };
};
