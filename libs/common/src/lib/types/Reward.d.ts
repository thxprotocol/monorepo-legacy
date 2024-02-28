type TInfoLink = {
    label: string;
    url: string;
};

type TQuestLock = { variant: QuestVariant; questId: string };

type TReward = {
    _id: string;
    variant: RewardVariant;
    uuid: string;
    poolId: string;
    title: string;
    description: string;
    expiryDate: Date;
    claimAmount: number;
    claimLimit: number;
    limit: number;
    pointPrice: number;
    image: string;
    index: number;
    locks: TQuestLock[];
    isPromoted: boolean;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    update: (payload: Partial<TReward>) => Promise<void>;
    delete: (payload: Partial<TReward>) => Promise<void>;
};

type TRewardPayment = {
    _id: string;
    rewardId: string;
    poolId: string;
    amount: number;
    sub: string;
    createdAt: Date;
};
