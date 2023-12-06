import mongoose from 'mongoose';
import { TERC1155Perk } from '@thxnetwork/types/';
import { perkBaseSchema } from '@thxnetwork/api/models/ERC20Perk';

export type ERC1155PerkDocument = mongoose.Document & TERC1155Perk;

const schema = new mongoose.Schema(
    {
        ...perkBaseSchema,
        erc1155Id: String,
        erc1155metadataId: String,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const ERC1155Perk = mongoose.model<ERC1155PerkDocument>('erc1155perks', schema);
