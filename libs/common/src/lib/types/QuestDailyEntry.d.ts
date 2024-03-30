type TQuestDailyEntry = {
    questId: string;
    poolId: string;
    sub: string;
    uuid: string;
    amount: string;
    createdAt: Date;
    metadata: TQuestDailyEntryMetadata;
};

type TQuestDailyEntryMetadata = {
    ip: string;
    state: DailyRewardClaimState;
};
