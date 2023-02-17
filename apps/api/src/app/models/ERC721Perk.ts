import mongoose from 'mongoose';
import { TERC721Perk } from '@thxnetwork/types/';
import { rewardBaseSchema } from '@thxnetwork/api/models/ERC20Perk';

export type ERC721PerkDocument = mongoose.Document & TERC721Perk;

const schema = new mongoose.Schema(
    {
        ...rewardBaseSchema,
        erc721Id: String,
        erc721metadataId: String,
        pointPrice: Number,
        image: String,
        price: Number,
        priceCurrency: String,
        paymentLinkId: String,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const ERC721Perk = mongoose.model<ERC721PerkDocument>('erc721perks', schema);
