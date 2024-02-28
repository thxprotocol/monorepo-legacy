import mongoose from 'mongoose';
import { RewardVariant } from '@thxnetwork/common/enums';
import { rewardSchema } from './Reward';

export type RewardNFTDocument = mongoose.Document & TRewardNFT;

export const RewardNFT = mongoose.model<RewardNFTDocument>(
    'RewardNFT',
    new mongoose.Schema(
        {
            ...rewardSchema,
            variant: { type: Number, default: RewardVariant.NFT },
            erc721Id: String,
            erc1155Id: String,
            erc1155Amount: String,
            metadataId: String,
            tokenId: String,
            price: Number,
            priceCurrency: String,
            redirectUrl: String,
        },
        { timestamps: true },
    ),
    'rewardnft',
);
