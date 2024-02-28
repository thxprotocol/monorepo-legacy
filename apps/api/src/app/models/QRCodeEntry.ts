import mongoose from 'mongoose';

export type QRCodeEntryDocument = mongoose.Document & TQRCodeEntry;

export const QRCodeEntry = mongoose.model<QRCodeEntryDocument>(
    'QRCodeEntry',
    new mongoose.Schema(
        {
            sub: String,
            uuid: String,
            poolId: String,
            redirectUrl: String,
            erc20Id: String,
            erc721Id: String,
            erc1155Id: String,
            rewardUuid: String,
            amount: Number,
            claimedAt: Date,
        },
        { timestamps: true },
    ),
    'qrcodeentry',
);
