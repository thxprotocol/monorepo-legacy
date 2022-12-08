import mongoose from 'mongoose';
import { TERC721Perk } from '@thxnetwork/types/';
import { rewardBaseSchema } from '@thxnetwork/api/models/ERC20Perk';

export type ERC721PerkDocument = mongoose.Document & TERC721Perk;

const erc721PerkSchema = new mongoose.Schema(
    {
        ...rewardBaseSchema,
        erc721metadataId: String,
        pointPrice: Number,
        image: String,
    },
    { timestamps: true },
);

export const ERC721Perk = mongoose.model<ERC721PerkDocument>('erc721perks', erc721PerkSchema);
