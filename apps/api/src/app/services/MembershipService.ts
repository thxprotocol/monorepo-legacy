import { Membership } from '@thxnetwork/api/models/Membership';
import { getContractFromName } from '@thxnetwork/api/config/contracts';
import { ERC721Variant } from '@thxnetwork/api/types/enums/ERC721Variant';
import { ERC721 } from '@thxnetwork/api/models/ERC721';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { ERC20Token } from '@thxnetwork/api/models/ERC20Token';
import { ChainId } from '@thxnetwork/api/types/enums';
import ERC20Service from './ERC20Service';
import ERC721Service from './ERC721Service';

export default class MembershipService {
    static findForSub(sub: string) {
        return Membership.find({ sub });
    }

    static async hasMembership(assetPool: AssetPoolDocument, sub: string) {
        const membership = await Membership.findOne({
            sub,
            chainId: assetPool.chainId,
            poolId: String(assetPool._id),
        });

        return !!membership;
    }

    static getById(id: string) {
        return Membership.findById(id);
    }

    static async addERC20Membership(sub: string, assetPool: AssetPoolDocument) {
        const membership = await Membership.findOne({ sub, poolId: String(assetPool._id) });

        if (!membership) {
            const erc20 = await ERC20Service.findByPool(assetPool);
            const erc20TokenExists = await ERC20Token.exists({
                sub,
                erc20Id: String(erc20._id),
            });

            if (!erc20TokenExists) {
                await ERC20Token.create({
                    sub,
                    erc20Id: String(erc20._id),
                });
            }

            await Membership.create({
                sub,
                chainId: assetPool.chainId,
                poolId: String(assetPool._id),
                erc20Id: String(erc20._id),
            });
        }
    }

    static async addERC721Membership(sub: string, assetPool: AssetPoolDocument) {
        const membership = await Membership.findOne({
            sub,
            chainId: assetPool.chainId,
            poolId: String(assetPool._id),
        });

        if (!membership) {
            let erc721 = await ERC721Service.findByPool(assetPool);
            const address = erc721.address;

            if (!erc721) {
                const contract = getContractFromName(assetPool.chainId, 'NonFungibleToken', address);
                const [name, symbol] = await Promise.all([
                    contract.methods.name().call(),
                    contract.methods.symbol().call(),
                ]);

                erc721 = await ERC721.create({
                    name,
                    symbol,
                    address,
                    type: ERC721Variant.Unknown,
                    chainId: assetPool.chainId,
                });
            }

            await Membership.create({
                sub,
                chainId: assetPool.chainId,
                poolId: String(assetPool._id),
                erc721Id: String(erc721._id),
            });
        }
    }

    static async removeMembership(sub: string, assetPool: AssetPoolDocument) {
        await Membership.deleteOne({
            sub,
            poolId: String(assetPool._id),
        });
    }

    static remove(id: string) {
        return Membership.deleteOne({ _id: id });
    }

    static countByNetwork(chainId: ChainId) {
        return Membership.countDocuments({ chainId });
    }
}
