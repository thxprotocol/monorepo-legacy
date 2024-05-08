import mongoose from 'mongoose';

export type ERC721TokenDocument = mongoose.Document & TERC721Token;

export const ERC721Token = mongoose.model<ERC721TokenDocument>(
    'ERC721Token',
    new mongoose.Schema(
        {
            erc721Id: String,
            walletId: String,
            metadataId: String,
            tokenId: Number,
            sub: String,
            state: Number,
            tokenUri: String,
            recipient: String,
            failReason: String,
            transactions: [String],
        },
        { timestamps: true },
    ),
    'erc721token',
);
