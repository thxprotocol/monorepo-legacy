import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { getByteCodeForContractName, getContractFromName } from '../config/contracts';
import { IAccount } from '../models/Account';
import Wallet from '../models/Wallet';
import { ChainId } from '../types/enums';
import { getProvider } from '../util/network';
import TransactionService from './TransactionService';

export default class WalletService {
    static async create(chainId: ChainId, account: IAccount) {
        const address = await this.deploy(chainId);
        return await Wallet.create({ sub: String(account.id), address });
    }

    static findByAddress(address: string) {
        return Wallet.findOne({ address });
    }

    static async findByQuery(query: { sub?: string }, page = 1, limit = 10) {
        return paginatedResults(Wallet, page, limit, query);
    }

    static async deploy(chainId: ChainId) {
        const contractName = 'SharedWallet';
        const contract = getContractFromName(chainId, contractName);
        const bytecode = getByteCodeForContractName(contractName);
        const { relayer, defaultAccount } = getProvider(chainId);
        const ownerAddress = relayer ? (await relayer.getRelayer()).address : defaultAccount;
        const fn = contract.deploy({
            data: bytecode,
            arguments: [ownerAddress],
        });

        const receipt = await TransactionService.send(null, fn, chainId);
        return receipt.contractAddress;
    }
}
