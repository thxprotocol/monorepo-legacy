import mongoose from 'mongoose';
import { TERC1155Token } from '@thxnetwork/types/interfaces';

export type ERC1155TokenDocument = mongoose.Document & TERC1155Token;

const ERC1155TokenSchema = new mongoose.Schema(
    {
        sub: String,
        state: Number,
        erc1155Id: String,
        metadataId: String,
        tokenId: Number,
        tokenUri: String,
        recipient: String,
        transactions: [String],
        walletId: String,
    },
    { timestamps: true },
);
export const ERC1155Token = mongoose.model<ERC1155TokenDocument>('ERC1155Token', ERC1155TokenSchema, 'erc1155token');
