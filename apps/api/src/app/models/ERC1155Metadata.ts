import mongoose from 'mongoose';

export type ERC1155MetadataDocument = mongoose.Document & TERC1155Metadata;

export const ERC1155Metadata = mongoose.model<ERC1155MetadataDocument>(
    'ERC1155Metadata',
    new mongoose.Schema(
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
    ),
    'erc1155metadata',
);
