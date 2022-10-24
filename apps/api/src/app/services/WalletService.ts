import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { getByteCodeForContractName, getContractFromName } from '../config/contracts';
import { IAccount } from '../models/Account';
import Wallet, { WalletDocument } from '../models/Wallet';
import { ChainId } from '../types/enums';
import { getProvider } from '../util/network';
import TransactionService from './TransactionService';

export default class WalletService {
    static async create(chainId: ChainId, account: IAccount) {
        const wallet = await Wallet.create({ sub: String(account.id), chainId });
        const address = await this.deploy(wallet, chainId);
        return await Wallet.findByIdAndUpdate(wallet._id, { address }, { new: true });
    }

    static findByAddress(address: string) {
        return Wallet.findOne({ address });
    }

    static async findByQuery(query: { sub?: string; chainId?: number }, page = 1, limit = 10) {
        return paginatedResults(Wallet, page, limit, query);
    }

    static async deploy(wallet: WalletDocument, chainId: ChainId) {
        const contract = getContractFromName(wallet.chainId, wallet.contractName);
        const bytecode = getByteCodeForContractName(wallet.contractName);
        const { defaultAccount } = getProvider(chainId);
        const fn = contract.deploy({
            data: bytecode,
            arguments: [defaultAccount],
        });
        const receipt = await TransactionService.send(null, fn, chainId);
        return receipt.contractAddress;
    }
}
