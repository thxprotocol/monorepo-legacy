import mongoose from 'mongoose';
import { TERC721Reward } from '@thxnetwork/types/';
import { rewardBaseSchema } from '../util/rewards';

export type ERC721RewardDocument = mongoose.Document & TERC721Reward;

const schema = new mongoose.Schema(
    {
        ...rewardBaseSchema,
        erc721metadataId: String,
    },
    { timestamps: true },
);

schema.virtual('isConditional', (r: TERC721Reward) => {
    return r.platform && r.interaction && r.content;
});

export const ERC721Reward = mongoose.model<ERC721RewardDocument>('erc721rewards', schema);
