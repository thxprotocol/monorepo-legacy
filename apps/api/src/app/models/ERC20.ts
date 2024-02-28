import mongoose from 'mongoose';
import { getAbiForContractName } from '@thxnetwork/api/services/ContractService';
import { ERC20Type } from '@thxnetwork/common/enums';
import { getProvider } from '@thxnetwork/api/util/network';

export type ERC20Document = mongoose.Document & TERC20;

const schema = new mongoose.Schema(
    {
        sub: String,
        type: Number,
        address: String,
        chainId: Number,
        name: String,
        symbol: String,
        transactions: [String],
        archived: Boolean,
        logoImgUrl: String,
    },
    { timestamps: true },
);

schema.virtual('contractName').get(function () {
    return getContractName(this.type);
});

schema.virtual('contract').get(function () {
    if (!this.address) return;
    const { readProvider, defaultAccount } = getProvider(this.chainId);
    const abi = getAbiForContractName(getContractName(this.type));
    return new readProvider.eth.Contract(abi, this.address, { from: defaultAccount });
});

function getContractName(type: ERC20Type) {
    return type === ERC20Type.Unlimited ? 'UnlimitedSupplyToken' : 'LimitedSupplyToken';
}

export const ERC20 = mongoose.model<ERC20Document>('ERC20', schema, 'erc20');
