import mongoose from 'mongoose';
import type { TERC1155Metadata } from '@thxnetwork/api/types/TERC1155';

export type ERC1155MetadataDocument = mongoose.Document & TERC1155Metadata;

const ERC1155MetadataSchema = new mongoose.Schema(
    {
        erc1155: String,
        title: String,
        description: String,
        attributes: [{ key: String, value: String }],
    },
    { timestamps: true },
);
export const ERC1155Metadata = mongoose.model<ERC1155MetadataDocument>(
    'ERC1155Metadata',
    ERC1155MetadataSchema,
    'erc1155metadata',
);
