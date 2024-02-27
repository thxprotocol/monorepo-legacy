type TQuestSocialEntry = {
    _id: string;
    questId: string;
    sub: string;
    amount: string;
    poolId: string;
    platformUserId: string;
    publicMetrics: TTwitterUserPublicMetrics;
    createdAt: Date;
    account?: TAccount;
    wallet?: TWallet;
};
