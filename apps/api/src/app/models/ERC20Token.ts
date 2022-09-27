import mongoose from 'mongoose';
import { TERC20Token } from '@thxnetwork/api/types/TERC20';

export type ERC20TokenDocument = mongoose.Document & TERC20Token;

const erc20TokenSchema = new mongoose.Schema(
    {
        sub: String,
        erc20Id: String,
    },
    { timestamps: true },
);

export const ERC20Token = mongoose.model<ERC20TokenDocument>('ERC20Token', erc20TokenSchema, 'erc20token');
