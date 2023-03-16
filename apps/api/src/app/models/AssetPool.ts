import mongoose from 'mongoose';
import { getDiamondAbi } from '@thxnetwork/api/config/contracts';
import { TPool } from '@thxnetwork/types/index';
import { getProvider } from '@thxnetwork/api/util/network';

export type AssetPoolDocument = mongoose.Document & TPool;

const assetPoolSchema = new mongoose.Schema(
    {
        sub: String,
        address: String,
        chainId: Number,
        transactions: [String],
        lastTransactionAt: Date,
        version: String,
        archived: Boolean,
        title: String,
        discordWebhookUrl: String,
        settings: {
            isTwitterSyncEnabled: { type: Boolean, default: false },
            defaults: {
                conditionalRewards: {
                    title: String,
                    description: String,
                    amount: Number,
                },
            },
        },
    },
    { timestamps: true },
);

assetPoolSchema.virtual('contract').get(function () {
    if (!this.address) return;
    const { readProvider, defaultAccount } = getProvider(this.chainId);
    const abi = getDiamondAbi(this.chainId, 'defaultDiamond');
    return new readProvider.eth.Contract(abi, this.address, { from: defaultAccount });
});

export const AssetPool = mongoose.model<AssetPoolDocument>('AssetPool', assetPoolSchema);
