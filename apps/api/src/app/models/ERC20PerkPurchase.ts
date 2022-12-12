import mongoose from 'mongoose';
import { TERC20PerkPurchase } from '@thxnetwork/types/';

export type ERC20PerkPurchaseDocument = mongoose.Document & TERC20PerkPurchase;

const erc20PerkPurchaseSchema = new mongoose.Schema(
    {
        perkId: String,
        sub: String,
    },
    { timestamps: true },
);

export const ERC20PerkPurchase = mongoose.model<ERC20PerkPurchaseDocument>(
    'erc20perkpurchases',
    erc20PerkPurchaseSchema,
);
