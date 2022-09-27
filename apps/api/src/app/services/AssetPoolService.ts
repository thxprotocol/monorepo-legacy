import { assertEvent, CustomEventLog, findEvent } from '@thxnetwork/api/util/events';
import { ChainId, DepositState, ERC20Type } from '@thxnetwork/api/types/enums';
import { AssetPool, AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { getProvider } from '@thxnetwork/api/util/network';
import { Membership } from '@thxnetwork/api/models/Membership';
import TransactionService from './TransactionService';
import { diamondContracts, getContract, poolFacetAdressesPermutations } from '@thxnetwork/api/config/contracts';
import { pick } from '@thxnetwork/api/util';
import { diamondSelectors, getDiamondCutForContractFacets, updateDiamondContract } from '@thxnetwork/api/util/upgrades';
import { currentVersion } from '@thxnetwork/artifacts';
import { TransactionDocument } from '@thxnetwork/api/models/Transaction';
import MembershipService from './MembershipService';
import ERC20Service from './ERC20Service';
import ERC721Service from './ERC721Service';
import { Deposit } from '@thxnetwork/api/models/Deposit';
import { TAssetPool } from '@thxnetwork/api/types/TAssetPool';
import { ADDRESS_ZERO } from '@thxnetwork/api/config/secrets';
import { isAddress } from 'ethers/lib/utils';

export const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

export default class AssetPoolService {
    static isPoolClient(clientId: string, poolId: string) {
        return AssetPool.exists({ _id: poolId, clientId });
    }

    static isPoolMember(sub: string, poolId: string) {
        return Membership.exists({
            sub,
            poolId,
        });
    }

    static isPoolOwner(sub: string, poolId: string) {
        return AssetPool.exists({
            _id: poolId,
            sub,
        });
    }

    static getById(id: string) {
        return AssetPool.findById(id);
    }

    static getByAddress(address: string) {
        return AssetPool.findOne({ address });
    }

    static async deploy(
        sub: string,
        chainId: ChainId,
        erc20Address: string,
        erc721Address: string,
    ): Promise<AssetPoolDocument> {
        const factory = getContract(chainId, 'Factory', currentVersion);
        const poolFacetContracts = diamondContracts(chainId, 'defaultDiamond');
        const pool = new AssetPool({
            sub,
            chainId,
            variant: 'defaultDiamond',
            version: currentVersion,
            archived: false,
        });
        const callback = async (tx: TransactionDocument, events?: CustomEventLog[]): Promise<AssetPoolDocument> => {
            if (events) {
                const event = findEvent('DiamondDeployed', events);
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
            }
            pool.transactions.push(String(tx._id));

            return await pool.save();
        };

        return await TransactionService.relay(
            factory,
            'deploy',
            [getDiamondCutForContractFacets(poolFacetContracts, []), erc20Address, erc721Address],
            pool.chainId,
            callback,
        );
    }

    static async topup(assetPool: TAssetPool, amount: string) {
        const { defaultAccount } = getProvider(assetPool.chainId);
        const deposit = await Deposit.create({
            amount,
            sender: defaultAccount,
            receiver: assetPool.address,
            state: DepositState.Pending,
        });

        return await TransactionService.relay(
            assetPool.contract,
            'transferFrom',
            [defaultAccount, assetPool.address, amount],
            assetPool.chainId,
            async (tx: TransactionDocument, events: CustomEventLog[]) => {
                if (events) {
                    assertEvent('ERC20ProxyTransferFrom', events);
                    deposit.state = DepositState.Completed;
                }

                deposit.transactions.push(String(tx._id));

                return await deposit.save();
            },
        );
    }

    static async getAllBySub(sub: string, archived = false) {
        if (archived) return await AssetPool.find({ sub });
        return await AssetPool.find({ sub, archived });
    }

    static getAll() {
        return AssetPool.find({});
    }

    static remove(pool: AssetPoolDocument) {
        return AssetPool.deleteOne({ _id: String(pool._id) });
    }

    static findByAddress(address: string) {
        return AssetPool.findOne({
            address: address,
        });
    }

    static async countByNetwork(chainId: ChainId) {
        return await AssetPool.countDocuments({ chainId });
    }

    static async contractVersionVariant(assetPool: AssetPoolDocument) {
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

    static async updateAssetPool(pool: AssetPoolDocument, version?: string) {
        const tx = await updateDiamondContract(pool.chainId, pool.contract, 'defaultDiamond', version);

        pool.version = version;

        await pool.save();

        return tx;
    }
}
