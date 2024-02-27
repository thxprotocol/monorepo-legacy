import mongoose from 'mongoose';
import { RewardVariant } from '@thxnetwork/common/enums';
import { questSchema } from '@thxnetwork/api/models/Quest';

export type RewardNFTDocument = mongoose.Document & TRewardNFT;

const schema = new mongoose.Schema(
    {
        ...questSchema,
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
);

export const RewardNFT = mongoose.model<RewardNFTDocument>('erc721perks', schema);
