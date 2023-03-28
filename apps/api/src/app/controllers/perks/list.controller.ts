import { Request, Response } from 'express';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import { ERC20Perk, ERC20PerkDocument } from '@thxnetwork/api/models/ERC20Perk';
import { ERC721Perk, ERC721PerkDocument } from '@thxnetwork/api/models/ERC721Perk';
import { redeemValidation } from '@thxnetwork/api/util/perks';
import { ERC721PerkPayment } from '@thxnetwork/api/models/ERC721PerkPayment';
import { ShopifyPerk, ShopifyPerkDocument } from '@thxnetwork/api/models/ShopifyPerk';
import { ERC20PerkPayment } from '@thxnetwork/api/models/ERC20PerkPayment';
import { ShopifyPerkPayment } from '@thxnetwork/api/models/ShopifyPerkPayment';

type TAllPerks = ERC20PerkDocument | ERC721PerkDocument | ShopifyPerkDocument;

async function getProgress(r: TAllPerks, model: any) {
    if (!r.limit) return;
    return {
        count: await model.countDocuments({ perkId: r._id }),
        limit: r.limit,
    };
}

async function getExpiry(r: TAllPerks) {
    if (!r.expiryDate) return;
    return {
        now: Date.now(),
        date: new Date(r.expiryDate).getTime(),
    };
}

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const query = {
        poolId: pool._id,
        $or: [{ pointPrice: { $gt: 0 } }, { price: { $gt: 0 } }],
    };
    const erc20Perks = await ERC20Perk.find(query);
    const erc721Perks = await ERC721Perk.find(query);
    const shopifyPerks = await ShopifyPerk.find(query);

    res.json({
        erc20Perks: await Promise.all(
            erc20Perks.map(async (r) => {
                const { isError } = await redeemValidation({ perk: r });
                return {
                    _id: r._id,
                    uuid: r.uuid,
                    title: r.title,
                    description: r.description,
                    amount: r.amount,
                    pointPrice: r.pointPrice,
                    image: r.image,
                    isPromoted: r.isPromoted,
                    limit: r.limit,
                    isDisabled: isError,
                    isOwned: false,
                    erc20: await ERC20Service.getById(r.erc20Id),
                    expiry: await getExpiry(r),
                    progress: await getProgress(r, ERC20PerkPayment),
                };
            }),
        ),
        erc721Perks: await Promise.all(
            erc721Perks.map(async (r) => {
                const { isError } = await redeemValidation({ perk: r });
                return {
                    _id: r._id,
                    uuid: r.uuid,
                    title: r.title,
                    description: r.description,
                    pointPrice: r.pointPrice,
                    price: r.price,
                    priceCurrency: r.priceCurrency,
                    image: r.image,
                    isPromoted: r.isPromoted,
                    isDisabled: isError,
                    isOwned: false,
                    erc721: await ERC721Service.findById(r.erc721Id),
                    erc721metadataId: r.erc721metadataId,
                    metadata: await ERC721Service.findMetadataById(r.erc721metadataId),
                    expiry: await getExpiry(r),
                    progress: await getProgress(r, ERC721PerkPayment),
                };
            }),
        ),
        shopifyPerks: await Promise.all(
            shopifyPerks.map(async (r) => {
                const { isError } = await redeemValidation({ perk: r });
                return {
                    _id: r._id,
                    uuid: r.uuid,
                    title: r.title,
                    description: r.description,
                    pointPrice: r.pointPrice,
                    price: r.price,
                    priceCurrency: r.priceCurrency,
                    image: r.image,
                    isPromoted: r.isPromoted,
                    priceRuleId: r.priceRuleId,
                    discountCode: r.discountCode,
                    limit: r.limit,
                    isDisabled: isError,
                    isOwned: false,
                    expiry: await getExpiry(r),
                    progress: await getProgress(r, ShopifyPerkPayment),
                };
            }),
        ),
    });
};

export default { controller };
