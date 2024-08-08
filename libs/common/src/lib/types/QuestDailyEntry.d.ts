type TQuestDailyEntry = TBaseQuestEntry & {
    amount: string;
    metadata: TQuestDailyEntryMetadata;
};

type TQuestDailyEntryMetadata = {
    ip: string;
    state: DailyRewardClaimState;
};
