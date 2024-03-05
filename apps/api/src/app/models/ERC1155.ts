import mongoose from 'mongoose';
import { getAbiForContractName } from '@thxnetwork/api/services/ContractService';
import { getProvider } from '@thxnetwork/api/util/network';

export type ERC1155Document = mongoose.Document & TERC1155;

const schema = new mongoose.Schema(
    {
        variant: String,
        chainId: Number,
        sub: String,
        name: String,
        description: String,
        transactions: [String],
        address: String,
        baseURL: String,
        archived: Boolean,
        logoImgUrl: String,
    },
    { timestamps: true },
);

schema.virtual('contract').get(function () {
    if (!this.address) return;
    const { readProvider, defaultAccount } = getProvider(this.chainId);
    const abi = getAbiForContractName('THX_ERC1155');
    return new readProvider.eth.Contract(abi, this.address, { from: defaultAccount });
});

export const ERC1155 = mongoose.model<ERC1155Document>('ERC1155', schema, 'erc1155');
