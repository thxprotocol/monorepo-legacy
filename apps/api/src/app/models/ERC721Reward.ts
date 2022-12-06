import mongoose from 'mongoose';
import { TERC721Reward } from '@thxnetwork/types/';
import { rewardBaseSchema } from '@thxnetwork/api/models/ERC20Reward';

export type ERC721RewardDocument = mongoose.Document & TERC721Reward;

const erc721RewardSchema = new mongoose.Schema(
    {
        ...rewardBaseSchema,
        erc721metadataId: String,
        pointPrice: Number,
        image: String,
    },
    { timestamps: true },
);

export const ERC721Reward = mongoose.model<ERC721RewardDocument>('erc721rewards', erc721RewardSchema);
