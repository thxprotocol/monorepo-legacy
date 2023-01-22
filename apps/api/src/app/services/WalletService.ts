import { ContractName, diamondFacetConfigs, DiamondVariant } from '@thxnetwork/contracts/exports';
import { getByteCodeForContractName, getContractFromName } from '../config/contracts';
import { IAccount } from '../models/Account';
import { Wallet, WalletDocument } from '../models/Wallet';
import { ChainId } from '../types/enums';
import { TWalletDeployCallbackArgs } from '../types/TTransaction';
import { getProvider, getSelectors } from '../util/network';
import TransactionService from './TransactionService';
import { TransactionReceipt } from 'web3-core';
import { FacetCutAction } from '../util/upgrades';
import WalletManagerService from './WalletManagerService';
import AccountProxy from '../proxies/AccountProxy';

async function create(chainId: ChainId, account: IAccount, forceSync = true) {
    const sub = String(account.sub);
    const wallet = await Wallet.create({ sub, chainId });
    return deploy(wallet, chainId, sub, forceSync);
}

function findOneByAddress(address: string) {
    return Wallet.findOne({ address });
}

async function findOneByQuery(query: { sub?: string; chainId?: number }) {
    return await Wallet.findOne(query);
}

async function findByQuery(query: { sub?: string; chainId?: number }) {
    const result = await Wallet.find(query);
    return result;
}

async function deploy(wallet: WalletDocument, chainId: ChainId, sub: string, forceSync = true) {
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
        args: { walletId: String(wallet._id), owner: defaultAccount, sub },
    });

    return await Wallet.findByIdAndUpdate(wallet._id, { transactions: [txId] }, { new: true });
}

async function deployCallback(args: TWalletDeployCallbackArgs, receipt: TransactionReceipt) {
    const wallet = await Wallet.findByIdAndUpdate(args.walletId, { address: receipt.contractAddress }, { new: true });
    await AccountProxy.update(args.sub, { walletAddress: receipt.contractAddress });
    await WalletManagerService.setupManagerRoleAdmin(wallet, args.owner);
}

export default { create, findOneByAddress, findByQuery, deploy, deployCallback, findOneByQuery };
