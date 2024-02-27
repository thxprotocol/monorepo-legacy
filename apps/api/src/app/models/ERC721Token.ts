import mongoose from 'mongoose';

export type ERC721TokenDocument = mongoose.Document & TERC721Token;

const ERC721TokenSchema = new mongoose.Schema(
    {
        sub: String,
        state: Number,
        erc721Id: String,
        metadataId: String,
        tokenId: Number,
        tokenUri: String,
        recipient: String,
        failReason: String,
        transactions: [String],
        walletId: { type: String, index: 'hashed' },
    },
    { timestamps: true },
);
export const ERC721Token = mongoose.model<ERC721TokenDocument>('ERC721Token', ERC721TokenSchema, 'erc721token');
