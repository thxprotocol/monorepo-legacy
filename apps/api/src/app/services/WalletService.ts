import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { getByteCodeForContractName, getContractFromName } from '../config/contracts';
import { AssetPoolDocument } from '../models/AssetPool';
import Wallet from '../models/Wallet';
import { ChainId } from '../types/enums';
import { getProvider } from '../util/network';
import TransactionService from './TransactionService';

export default class WalletService {
    static async create(assetPool: AssetPoolDocument) {
        const address = await this.deploy(assetPool);
        return await Wallet.create({ poolId: assetPool.id, address });
    }

    static findByAddress(address: string) {
        return Wallet.findOne({ address });
    }

    static async findByQuery(query: { poolId: string }, page = 1, limit = 10) {
        return paginatedResults(Wallet, page, limit, query);
    }

    static async deploy(assetPool: AssetPoolDocument) {
        const contractName = 'SharedWallet';
        const contract = getContractFromName(assetPool.chainId, contractName);
        const bytecode = getByteCodeForContractName(contractName);
        const { relayer } = getProvider(assetPool.chainId);
        const fn = contract.deploy({
            data: bytecode,
            arguments: [(await relayer.getRelayer()).address],
        });

        const receipt = await TransactionService.send(null, fn, assetPool.chainId);
        return receipt.to;
    }
}
