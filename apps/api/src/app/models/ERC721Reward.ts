import mongoose from 'mongoose';
import { TERC721Reward } from '@thxnetwork/types/';
import { rewardBaseSchema } from '@thxnetwork/api/models/ERC20Reward';

export type ERC721RewardDocument = mongoose.Document & TERC721Reward;

const erc721RewardSchema = new mongoose.Schema(
    {
        ...rewardBaseSchema,
        erc721metadataId: String,
    },
    { timestamps: true },
);

erc721RewardSchema.virtual('isConditional', (r: TERC721Reward) => {
    return r.platform && r.interaction && r.content;
});

export const ERC721Reward = mongoose.model<ERC721RewardDocument>('erc721rewards', erc721RewardSchema);
