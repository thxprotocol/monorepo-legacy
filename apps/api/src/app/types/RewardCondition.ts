import mongoose from 'mongoose';
import { ChannelAction } from './enums/ChannelAction';
import { ChannelType } from './enums/ChannelType';

export type TRewardCondition = {
    channelType: ChannelType;
    channelAction: ChannelAction;
    channelItem: string;
};

export type RewardConditionDocument = mongoose.Document & TRewardCondition;

const rewardConditionSchema = new mongoose.Schema(
    {
        channelType: Number,
        channelAction: Number,
        channelItem: String,
    },
    { timestamps: true },
);

export const RewardCondition = mongoose.model<RewardConditionDocument>('RewardCondition', rewardConditionSchema);
