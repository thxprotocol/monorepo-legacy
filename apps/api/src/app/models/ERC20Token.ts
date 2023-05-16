import mongoose from 'mongoose';
import { TERC20Token } from '@thxnetwork/types/interfaces';

export type ERC20TokenDocument = mongoose.Document & TERC20Token;

const erc20TokenSchema = new mongoose.Schema(
    {
        sub: String,
        erc20Id: String,
        walletId: String,
    },
    { timestamps: true },
);

export const ERC20Token = mongoose.model<ERC20TokenDocument>('ERC20Token', erc20TokenSchema, 'erc20token');
