import mongoose from 'mongoose';

export type ERC721TransferDocument = mongoose.Document & TERC721Transfer;

export const ERC721Transfer = mongoose.model<ERC721TransferDocument>(
    'ERC721Transfer',
    new mongoose.Schema(
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
    ),
    'erc721transfer',
);
