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
    publicMetrics: TTwitterUserPublicMetrics;
};
