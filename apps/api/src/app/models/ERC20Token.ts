import mongoose from 'mongoose';

export type ERC20TokenDocument = mongoose.Document & TERC20Token;

export const ERC20Token = mongoose.model<ERC20TokenDocument>(
    'ERC20Token',
    new mongoose.Schema(
        {
            sub: String,
            erc20Id: String,
            walletId: { type: String, index: 'hashed' },
        },
        { timestamps: true },
    ),
    'erc20token',
);
