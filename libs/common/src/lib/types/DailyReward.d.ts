type TDailyReward = TBaseQuest & {
    amounts: number[];
    progress?: number;
    claims?: any[];
    events?: any[];
    eventName: string;
};
