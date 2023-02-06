import mongoose from 'mongoose';
import { TERC20Transfer } from '../types/TERC20Transfer';

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

export default mongoose.model<ERC20TransferDocument>('ERC20Transfer', erc20TransferSchema);
