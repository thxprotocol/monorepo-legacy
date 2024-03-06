import mongoose from 'mongoose';
import { getAbiForContractName } from '@thxnetwork/api/services/ContractService';
import { getProvider } from '@thxnetwork/api/util/network';

export type ERC721Document = mongoose.Document & TERC721;

const schema = new mongoose.Schema(
    {
        chainId: Number,
        sub: String,
        name: String,
        symbol: String,
        description: String,
        transactions: [String],
        address: String,
        baseURL: String,
        archived: Boolean,
        logoImgUrl: String,
        variant: String,
    },
    { timestamps: true },
);

schema.virtual('contract').get(function () {
    if (!this.address) return;
    const { readProvider, defaultAccount } = getProvider(this.chainId);
    const abi = getAbiForContractName('NonFungibleToken');
    return new readProvider.eth.Contract(abi, this.address, { from: defaultAccount });
});

export const ERC721 = mongoose.model<ERC721Document>('ERC721', schema, 'erc721');
