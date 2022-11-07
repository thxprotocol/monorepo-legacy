import { ContractName, diamondFacetConfigs, DiamondVariant } from '@thxnetwork/contracts/exports';
import { getByteCodeForContractName, getContractFromName } from '../config/contracts';
import { IAccount } from '../models/Account';
import Wallet, { WalletDocument } from '../models/Wallet';
import { ChainId } from '../types/enums';
import { TWalletDeployCallbackArgs } from '../types/TTransaction';
import { getProvider, getSelectors } from '../util/network';
import TransactionService from './TransactionService';
import { TransactionReceipt } from 'web3-core';
import { FacetCutAction } from '../util/upgrades';
import WalletManagerService from './WalletManagerService';

async function create(chainId: ChainId, account: IAccount, forceSync = true) {
    const wallet = await Wallet.create({ sub: String(account.id), chainId });
    return this.deploy(wallet, chainId, forceSync);
}

function findOneByAddress(address: string) {
    return Wallet.findOne({ address });
}

async function findByQuery(query: { sub?: string; chainId?: number }) {
    return await Wallet.find(query);
}

async function deploy(wallet: WalletDocument, chainId: ChainId, forceSync = true) {
    const variant: DiamondVariant = 'sharedWallet';
    const { networkName, defaultAccount } = getProvider(chainId);

    const facetConfigs = diamondFacetConfigs(networkName, variant);
    const diamondCut = [];

    for (const contractName in facetConfigs) {
        const config = facetConfigs[contractName];
        const contract = getContractFromName(chainId, contractName as ContractName);
        const functionSelectors = getSelectors(contract);
        diamondCut.push({
            action: FacetCutAction.Add,
            facetAddress: config.address,
            functionSelectors,
        });
    }

    const contractName: ContractName = 'Diamond';
    const contract = getContractFromName(chainId, contractName);
    const bytecode = getByteCodeForContractName(contractName);
    const fn = contract.deploy({
        data: bytecode,
        arguments: [diamondCut, [defaultAccount]],
    });

    const txId = await TransactionService.sendAsync(null, fn, chainId, forceSync, {
        type: 'walletDeployCallback',
        args: { walletId: String(wallet._id), owner: defaultAccount },
    });

    return await Wallet.findByIdAndUpdate(wallet._id, { transactions: [txId] }, { new: true });
}

async function deployCallback(args: TWalletDeployCallbackArgs, receipt: TransactionReceipt) {
    const wallet = await Wallet.findByIdAndUpdate(args.walletId, { address: receipt.contractAddress }, { new: true });
    await WalletManagerService.setupManagerRoleAdmin(wallet, args.owner);
}

export default { create, findOneByAddress, findByQuery, deploy, deployCallback };
