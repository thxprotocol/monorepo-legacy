import { assertEvent, parseLogs } from '@thxnetwork/api/util/events';
import { ChainId } from '@thxnetwork/api/types/enums';
import { AssetPool, AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { Membership } from '@thxnetwork/api/models/Membership';
import TransactionService from './TransactionService';
import { diamondContracts, getContract, poolFacetAdressesPermutations } from '@thxnetwork/api/config/contracts';
import { pick } from '@thxnetwork/api/util';
import { diamondSelectors, getDiamondCutForContractFacets, updateDiamondContract } from '@thxnetwork/api/util/upgrades';
import { currentVersion } from '@thxnetwork/contracts/exports';
import { TransactionReceipt } from 'web3-core';
import { TAssetPoolDeployCallbackArgs } from '@thxnetwork/api/types/TTransaction';
import { createDummyContents } from '../util/rewards';

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

async function deploy(sub: string, chainId: ChainId, title: string): Promise<AssetPoolDocument> {
    const factory = getContract(chainId, 'Factory', currentVersion);
    const variant = 'defaultDiamond';
    const poolFacetContracts = diamondContracts(chainId, variant);
    const pool = await AssetPool.create({
        sub,
        chainId,
        variant,
        version: currentVersion,
        archived: false,
        title,
    });
    const txId = await TransactionService.sendAsync(
        factory.options.address,
        factory.methods.deploy(getDiamondCutForContractFacets(poolFacetContracts, [])),
        pool.chainId,
        true,
        {
            type: 'assetPoolDeployCallback',
            args: { chainId, assetPoolId: String(pool._id) },
        },
    );

    return AssetPool.findByIdAndUpdate(pool._id, { transactions: [txId] }, { new: true });
}

async function deployCallback(args: TAssetPoolDeployCallbackArgs, receipt: TransactionReceipt) {
    const { assetPoolId, chainId } = args;
    const contract = getContract(chainId, 'Factory');
    const pool = await getById(assetPoolId);
    const events = parseLogs(contract.options.jsonInterface, receipt.logs);
    const event = assertEvent('DiamondDeployed', events);
    pool.address = event.args.diamond;
    await pool.save();

    // if is the first pool for the account, create dummy contents for the pool
    const poolsCount = await AssetPool.find({ sub: pool.sub }).count();
    if (poolsCount > 0) {
        return;
    }
    await createDummyContents(pool);
}

async function getAllBySub(sub: string, archived = false) {
    if (archived) return AssetPool.find({ sub });
    return AssetPool.find({ sub, archived });
}

function getAll() {
    return AssetPool.find({});
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
    getAllBySub,
    getAll,
    findByAddress,
    countByNetwork,
    contractVersionVariant,
    updateAssetPool,
};
