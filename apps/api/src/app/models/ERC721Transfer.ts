import mongoose from 'mongoose';

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

export const ERC721Transfer = mongoose.model<ERC721TransferDocument>('ERC721Transfer', erc721TransferSchema);
