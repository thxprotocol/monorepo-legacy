import mongoose from 'mongoose';

export type ERC20TransferDocument = mongoose.Document & TERC20Transfer;

const erc20TransferSchema = new mongoose.Schema(
    {
        erc20Id: String,
        from: String,
        to: String,
        chainId: Number,
        transactionId: String,
        sub: String,
    },
    { timestamps: true },
);

export const ERC20Transfer = mongoose.model<ERC20TransferDocument>('ERC20Transfer', erc20TransferSchema);
