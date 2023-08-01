import { ContractName, currentVersion, diamondFacetConfigs, DiamondVariant } from '@thxnetwork/contracts/exports';
import { getByteCodeForContractName, getContractFromName } from '../config/contracts';
import { Wallet as WalletModel, WalletDocument } from '../models/Wallet';
import { ChainId } from '@thxnetwork/types/enums';
import { TWalletDeployCallbackArgs } from '../types/TTransaction';
import { TransactionReceipt } from 'web3-core';
import { getProvider, getSelectors } from '../util/network';
import { FacetCutAction, updateDiamondContract } from '../util/upgrades';
import { toChecksumAddress } from 'web3-utils';
import { MilestoneRewardClaim } from '../models/MilestoneRewardClaims';
import TransactionService from './TransactionService';
import WalletManagerService from './WalletManagerService';

export const Wallet = WalletModel;

async function create(data: { chainId: ChainId; sub: string; forceSync?: boolean; address?: string }) {
    const { chainId, sub, address } = data;
    const wallet = await Wallet.create({ sub, chainId, address });
    if (address) return wallet;

    const forceSync = data.forceSync === undefined ? true : data.forceSync;
    return deploy(wallet, forceSync);
}

function findOneByAddress(address: string) {
    return Wallet.findOne({ address: toChecksumAddress(address) });
}

async function findPrimary(sub: string, chainId: ChainId) {
    return await Wallet.findOne({ sub, chainId, address: { $exists: true, $ne: '' } });
}

async function findOneByQuery(query: { sub?: string; chainId?: number }) {
    return await Wallet.findOne(query);
}

async function findByQuery(query: { sub?: string; chainId?: number }) {
    return await Wallet.find(query);
}

async function deploy(wallet: WalletDocument, forceSync = true) {
    const variant: DiamondVariant = 'sharedWallet';
    const { networkName, defaultAccount } = getProvider(wallet.chainId);

    const facetConfigs = diamondFacetConfigs(networkName, variant);
    const diamondCut = [];

    for (const contractName in facetConfigs) {
        const config = facetConfigs[contractName];
        const contract = getContractFromName(wallet.chainId, contractName as ContractName);
        const functionSelectors = getSelectors(contract);
        diamondCut.push({
            action: FacetCutAction.Add,
            facetAddress: config.address,
            functionSelectors,
        });
    }

    const contractName: ContractName = 'Diamond';
    const contract = getContractFromName(wallet.chainId, contractName);
    const bytecode = getByteCodeForContractName(contractName);
    const fn = contract.deploy({
        data: bytecode,
        arguments: [diamondCut, [defaultAccount]],
    });

    const txId = await TransactionService.sendAsync(null, fn, wallet.chainId, forceSync, {
        type: 'walletDeployCallback',
        args: { walletId: String(wallet._id), owner: defaultAccount, sub: wallet.sub },
    });

    return await Wallet.findByIdAndUpdate(wallet._id, { transactions: [txId], version: currentVersion }, { new: true });
}

async function deployCallback(args: TWalletDeployCallbackArgs, receipt: TransactionReceipt) {
    const wallet = await Wallet.findByIdAndUpdate(args.walletId, { address: receipt.contractAddress }, { new: true });
    await WalletManagerService.setupManagerRoleAdmin(wallet, args.owner);
}

async function upgrade(wallet: WalletDocument, version?: string) {
    const tx = await updateDiamondContract(wallet.chainId, wallet.contract, 'sharedWallet', version);

    if (tx) {
        wallet.version = version;
        await wallet.save();
    }

    return tx;
}

async function transferOwnership(wallet: WalletDocument, primaryWallet: WalletDocument) {
    // If found update all milestone reward claims for that walletId
    await MilestoneRewardClaim.updateMany(
        { walletId: String(wallet._id), isClaimed: false },
        { walletId: String(primaryWallet._id) },
    );

    return await Wallet.findByIdAndUpdate(wallet._id, { sub: primaryWallet.sub }, { new: true });
}

export default {
    transferOwnership,
    findPrimary,
    upgrade,
    create,
    findOneByAddress,
    findByQuery,
    deploy,
    deployCallback,
    findOneByQuery,
};
