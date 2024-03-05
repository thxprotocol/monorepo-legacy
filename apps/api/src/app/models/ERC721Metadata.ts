import mongoose from 'mongoose';

export type ERC721MetadataDocument = mongoose.Document & TERC721Metadata;

export const ERC721Metadata = mongoose.model<ERC721MetadataDocument>(
    'ERC721Metadata',
    new mongoose.Schema(
        {
            erc721Id: String,
            imageUrl: String,
            name: String,
            image: String,
            description: String,
            externalUrl: String,
        },
        { timestamps: true },
    ),
    'erc721metadata',
);
