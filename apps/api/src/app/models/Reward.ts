import mongoose from 'mongoose';

export enum ChannelType {
    None = 0,
    Google = 1,
    Twitter = 2,
}
export enum ChannelAction {
    YouTubeLike = 0,
    YouTubeSubscribe = 1,
    TwitterLike = 2,
    TwitterRetweet = 3,
    TwitterFollow = 4,
}

export enum RewardState {
    Disabled = 0,
    Enabled = 1,
}

export interface IRewardUpdates {
    withdrawAmount?: number;
    withdrawDuration?: number;
    state?: RewardState;
}

export interface IRewardCondition {
    channelType: ChannelType;
    channelAction: ChannelAction;
    channelItem: string;
}

export type TReward = {
    id: string;
    title: string;
    slug: string;
    poolId: string;
    poolAddress: string;
    state: number;
    expiryDate: Date;
    isMembershipRequired: boolean;
    isClaimOnce: boolean;
    erc721metadataId?: string;
    withdrawLimit: number;
    withdrawAmount: number;
    withdrawDuration: number;
    withdrawCondition: IRewardCondition;
    withdrawUnlockDate: Date;
    progress?: number;
    amount?: number;
};

export type RewardDocument = mongoose.Document & TReward;

const rewardSchema = new mongoose.Schema(
    {
        id: String,
        title: String,
        slug: String,
        expiryDate: Date, // Rename to expiresAt
        poolId: String,
        poolAddress: String,
        state: Number,
        isMembershipRequired: Boolean,
        isClaimOnce: Boolean,
        erc721metadataId: String,
        withdrawLimit: Number,
        withdrawAmount: Number,
        withdrawDuration: Number,
        withdrawCondition: {
            channelType: Number,
            channelAction: Number,
            channelItem: String,
        },
        withdrawUnlockDate: Date,
        amount: Number,
    },
    { timestamps: true },
);

export const Reward = mongoose.model<RewardDocument>('Reward', rewardSchema);
