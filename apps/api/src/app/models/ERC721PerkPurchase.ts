import mongoose from 'mongoose';
import { TERC721PerkPurchase } from '@thxnetwork/types/';

export type ERC721PerkPurchaseDocument = mongoose.Document & TERC721PerkPurchase;

const erc721PerkPurchaseSchema = new mongoose.Schema(
    {
        perkId: String,
        sub: String,
    },
    { timestamps: true },
);

export const ERC721PerkPurchase = mongoose.model<ERC721PerkPurchaseDocument>(
    'erc721perkpurchases',
    erc721PerkPurchaseSchema,
);
