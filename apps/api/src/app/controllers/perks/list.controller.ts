import { Request, Response } from 'express';
import { ERC20Perk, ERC20PerkDocument } from '@thxnetwork/api/models/ERC20Perk';
import { ERC721Perk, ERC721PerkDocument } from '@thxnetwork/api/models/ERC721Perk';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import { redeemValidation } from '@thxnetwork/api/util/perks';
import { ERC721PerkPayment } from '@thxnetwork/api/models/ERC721PerkPayment';
import { ShopifyPerk, ShopifyPerkDocument } from '@thxnetwork/api/models/ShopifyPerk';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { ERC20PerkPayment } from '@thxnetwork/api/models/ERC20PerkPayment';
import { ShopifyPerkPayment } from '@thxnetwork/api/models/ShopifyPerkPayment';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const erc20Perks = await ERC20Perk.find({ poolId: pool._id });
    const erc721Perks = await ERC721Perk.find({ poolId: pool._id });
    const shopifyPerks = await ShopifyPerk.find({ poolId: pool._id });

    res.json({
        erc20Perks: await Promise.all(
            erc20Perks
                .filter((p: ERC20PerkDocument) => p.pointPrice > 0)
                .map(async (r) => {
                    const progress = r.limit
                        ? {
                              count: await ERC20PerkPayment.countDocuments({ perkId: r._id }),
                              limit: r.limit,
                          }
                        : undefined;
                    const expiry = r.expiryDate
                        ? {
                              now: Date.now(),
                              date: new Date(r.expiryDate).getTime(),
                          }
                        : undefined;
                    const { isError } = await redeemValidation({ perk: r });
                    return {
                        _id: r._id,
                        uuid: r.uuid,
                        title: r.title,
                        description: r.description,
                        amount: r.amount,
                        pointPrice: r.pointPrice,
                        image: r.image,
                        isOwned: false,
                        isPromoted: r.isPromoted,
                        limit: r.limit,
                        erc20: await ERC20Service.getById(r.erc20Id),
                        isDisabled: isError,
                        expiry,
                        progress,
                    };
                }),
        ),
        erc721Perks: await Promise.all(
            erc721Perks
                .filter((p: ERC721PerkDocument) => p.pointPrice > 0 || p.price > 0)
                .map(async (r) => {
                    const progress = r.limit
                        ? {
                              count: await ERC721PerkPayment.countDocuments({ perkId: r._id }),
                              limit: r.limit,
                          }
                        : undefined;
                    const expiry = r.expiryDate
                        ? {
                              now: Date.now(),
                              date: new Date(r.expiryDate).getTime(),
                          }
                        : undefined;
                    return {
                        _id: r._id,
                        uuid: r.uuid,
                        title: r.title,
                        description: r.description,
                        erc721: await ERC721Service.findById(r.erc721Id),
                        erc721metadataId: r.erc721metadataId,
                        metadata: await ERC721Service.findMetadataById(r.erc721metadataId),
                        pointPrice: r.pointPrice,
                        price: r.price,
                        priceCurrency: r.priceCurrency,
                        image: r.image,
                        isOwned: false,
                        isPromoted: r.isPromoted,
                        isDisabled: (await redeemValidation({ perk: r })).isError,
                        expiry,
                        progress,
                    };
                }),
        ),
        shopifyPerks: await Promise.all(
            shopifyPerks
                .filter((p: ShopifyPerkDocument) => p.pointPrice > 0)
                .map(async (r) => {
                    const progress = r.limit
                        ? {
                              count: await ShopifyPerkPayment.countDocuments({ perkId: r._id }),
                              limit: r.limit,
                          }
                        : undefined;
                    const expiry = r.expiryDate
                        ? {
                              now: Date.now(),
                              date: new Date(r.expiryDate).getTime(),
                          }
                        : undefined;
                    return {
                        _id: r._id,
                        uuid: r.uuid,
                        title: r.title,
                        description: r.description,
                        pointPrice: r.pointPrice,
                        image: r.image,
                        isOwned: false,
                        isPromoted: r.isPromoted,
                        priceRuleId: r.priceRuleId,
                        discountCode: r.discountCode,
                        limit: r.limit,
                        isDisabled: (await redeemValidation({ perk: r })).isError,
                        expiry,
                        progress,
                    };
                }),
        ),
    });
};

export default { controller };
