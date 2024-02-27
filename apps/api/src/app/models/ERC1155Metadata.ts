import mongoose from 'mongoose';

export type ERC1155MetadataDocument = mongoose.Document & TERC1155Metadata;

const ERC1155MetadataSchema = new mongoose.Schema(
    {
        erc1155Id: String,
        imageUrl: String,
        name: String,
        image: String,
        description: String,
        externalUrl: String,
        tokenId: Number,
    },
    { timestamps: true },
);
export const ERC1155Metadata = mongoose.model<ERC1155MetadataDocument>(
    'ERC1155Metadata',
    ERC1155MetadataSchema,
    'erc1155metadata',
);
