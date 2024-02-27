type TInfoLink = {
    label: string;
    url: string;
};

type TQuestLock = { variant: QuestVariant; questId: string };

type TReward = {
    _id: string;
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
    isPromoted: boolean;
    page?: number;
    variant?: RewardVariant;
    createdAt?: string;
    updatedAt?: string;
    claims: [];
    isPublished: boolean;
    locks: TQuestLock[];
};

type TRewardPayment = {
    _id: string;
    rewardId: string;
    poolId: string;
    amount: number;
    sub: string;
};
