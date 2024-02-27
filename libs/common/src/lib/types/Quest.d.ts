type TQuest = TDailyReward | TQuestInvite | TQuestSocial | TMilestoneReward | TQuestWeb3 | TGitcoinQuest;
type TQuestEntry =
    | TDailyRewardClaim
    | TQuestInviteEntry
    | TQuestSocialEntry
    | TMilestoneRewardClaim
    | TQuestWeb3Entry
    | TGitcoinQuestEntry;

type TValidationResult = {
    reason: string;
    result: boolean;
};

type TBaseQuest = {
    _id: string;
    uuid: string;
    poolId: string;
    title: string;
    description: string;
    image: string;
    infoLinks: TInfoLink[];
    createdAt: string;
    updatedAt: string;
    page?: number;
    variant?: QuestVariant;
    index: number;
    isPublished: boolean;
    expiryDate: Date;
    locks: TQuestLock[];
    update: (payload: Partial<TQuest>) => Promise<void>;
    delete: (payload: Partial<TQuest>) => Promise<void>;
};
