import { assertEvent, parseLogs } from '@thxnetwork/api/util/events';
import { ChainId, DepositState } from '@thxnetwork/api/types/enums';
import { AssetPool, AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { getProvider } from '@thxnetwork/api/util/network';
import { Membership } from '@thxnetwork/api/models/Membership';
import TransactionService from './TransactionService';
import { diamondContracts, getContract, poolFacetAdressesPermutations } from '@thxnetwork/api/config/contracts';
import { pick } from '@thxnetwork/api/util';
import { diamondSelectors, getDiamondCutForContractFacets, updateDiamondContract } from '@thxnetwork/api/util/upgrades';
import { currentVersion } from '@thxnetwork/contracts/exports';
import ERC20Service from './ERC20Service';
import ERC721Service from './ERC721Service';
import { Deposit } from '@thxnetwork/api/models/Deposit';
import { TAssetPool } from '@thxnetwork/api/types/TAssetPool';
import { ADDRESS_ZERO } from '@thxnetwork/api/config/secrets';
import { isAddress } from 'ethers/lib/utils';
import { TransactionReceipt } from 'web3-core';
import { TAssetPoolDeployCallbackArgs, TTopupCallbackArgs } from '@thxnetwork/api/types/TTransaction';

export const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

function isPoolClient(clientId: string, poolId: string) {
    return AssetPool.exists({ _id: poolId, clientId });
}

function isPoolMember(sub: string, poolId: string) {
    return Membership.exists({
        sub,
        poolId,
    });
}

function isPoolOwner(sub: string, poolId: string) {
    return AssetPool.exists({
        _id: poolId,
        sub,
    });
}

function getById(id: string) {
    return AssetPool.findById(id);
}

function getByAddress(address: string) {
    return AssetPool.findOne({ address });
}

async function deploy(
    sub: string,
    chainId: ChainId,
    erc20Address: string,
    erc721Address: string,
): Promise<AssetPoolDocument> {
    const factory = getContract(chainId, 'Factory', currentVersion);
    const variant = 'defaultDiamond';
    const poolFacetContracts = diamondContracts(chainId, variant);
    const pool = await AssetPool.create({
        sub,
        chainId,
        variant,
        version: currentVersion,
        archived: false,
    });
    const txId = await TransactionService.sendAsync(
        factory.options.address,
        factory.methods.deploy(getDiamondCutForContractFacets(poolFacetContracts, []), erc20Address, erc721Address),
        pool.chainId,
        true,
        {
            type: 'assetPoolDeployCallback',
            args: { erc721Address, erc20Address, chainId, assetPoolId: String(pool._id) },
        },
    );

    return AssetPool.findByIdAndUpdate(pool._id, { transactions: [txId] }, { new: true });
}

async function deployCallback(args: TAssetPoolDeployCallbackArgs, receipt: TransactionReceipt) {
    const { assetPoolId, chainId, erc20Address, erc721Address } = args;
    const contract = getContract(chainId, 'Factory');
    const pool = await getById(assetPoolId);
    const events = parseLogs(contract.options.jsonInterface, receipt.logs);
    const event = assertEvent('DiamondDeployed', events);
    pool.address = event.args.diamond;

    if (isAddress(erc20Address) && erc20Address !== ADDRESS_ZERO) {
        const erc20 = await ERC20Service.findOrImport(pool, erc20Address);
        await ERC20Service.initialize(pool, erc20Address); // TODO Should move to ERC20Service
        pool.erc20Id = String(erc20._id);
    }

    if (isAddress(erc721Address) && erc721Address !== ADDRESS_ZERO) {
        const erc721 = await ERC721Service.findByQuery({
            address: erc721Address,
            chainId: pool.chainId,
        });
        await ERC721Service.initialize(pool, erc721Address); // TODO Should move to ERC721Service
        pool.erc721Id = String(erc721._id);
    }

    await pool.save();
}

async function topup(assetPool: TAssetPool, amount: string) {
    const { defaultAccount } = getProvider(assetPool.chainId);
    const deposit = await Deposit.create({
        amount,
        sender: defaultAccount,
        receiver: assetPool.address,
        state: DepositState.Pending,
    });

    const txId = await TransactionService.sendAsync(
        assetPool.contract.options.address,
        assetPool.contract.methods.transferFrom(defaultAccount, assetPool.address, amount),
        assetPool.chainId,
        true,
        { type: 'topupCallback', args: { receiver: assetPool.address, depositId: String(deposit._id) } },
    );

    return Deposit.findByIdAndUpdate(deposit._id, { transactions: [txId] }, { new: true });
}

async function topupCallback({ receiver, depositId }: TTopupCallbackArgs, receipt: TransactionReceipt) {
    const pool = await getByAddress(receiver);
    const events = parseLogs(pool.contract.options.jsonInterface, receipt.logs);

    assertEvent('ERC20ProxyTransferFrom', events);

    await Deposit.findByIdAndUpdate(depositId, { state: DepositState.Completed });
}

async function getAllBySub(sub: string, archived = false) {
    if (archived) return AssetPool.find({ sub });
    return AssetPool.find({ sub, archived });
}

function getAll() {
    return AssetPool.find({});
}

function remove(pool: AssetPoolDocument) {
    return AssetPool.deleteOne({ _id: String(pool._id) });
}

function findByAddress(address: string) {
    return AssetPool.findOne({
        address: address,
    });
}

async function countByNetwork(chainId: ChainId) {
    return AssetPool.countDocuments({ chainId });
}

async function contractVersionVariant(assetPool: AssetPoolDocument) {
    const permutations = Object.values(poolFacetAdressesPermutations(assetPool.chainId));
    const facets = await assetPool.contract.methods.facets().call();

    const facetAddresses = facets
        .filter((facet: any) => !facet.functionSelectors.every((sel: string) => diamondSelectors.includes(sel)))
        .map((facet: any) => facet.facetAddress);

    const match = permutations.find(
        (permutation) => permutation.facetAddresses.sort().join('') === facetAddresses.sort().join(''),
    );
    return match ? pick(match, ['version', 'variant']) : { version: 'unknown', variant: 'unknown' };
}

async function updateAssetPool(pool: AssetPoolDocument, version?: string) {
    const tx = await updateDiamondContract(pool.chainId, pool.contract, 'defaultDiamond', version);

    pool.version = version;

    await pool.save();

    return tx;
}

export default {
    isPoolClient,
    isPoolMember,
    isPoolOwner,
    getById,
    getByAddress,
    deploy,
    deployCallback,
    topup,
    topupCallback,
    getAllBySub,
    getAll,
    remove,
    findByAddress,
    countByNetwork,
    contractVersionVariant,
    updateAssetPool,
};
