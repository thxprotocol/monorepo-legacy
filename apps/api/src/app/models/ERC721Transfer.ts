import mongoose from 'mongoose';
import { TERC721Transfer } from '../types/TERC721Transfer';

export type ERC721TransferDocument = mongoose.Document & TERC721Transfer;

const erc721TransferSchema = new mongoose.Schema(
    {
        erc721Id: String,
        erc721TokenId: String,
        from: String,
        to: String,
        chainId: Number,
        transactionId: String,
        sub: String,
    },
    { timestamps: true },
);

export default mongoose.model<ERC721TransferDocument>('ERC721Transfer', erc721TransferSchema);
