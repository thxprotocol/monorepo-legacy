import { Request, Response } from 'express';
import jwt_decode from 'jwt-decode';
import { ERC20Perk } from '@thxnetwork/api/models/ERC20Perk';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import { ERC721PerkPayment } from '@thxnetwork/api/models/ERC721PerkPayment';
import { ShopifyPerk } from '@thxnetwork/api/models/ShopifyPerk';
import { ERC20PerkPayment } from '@thxnetwork/api/models/ERC20PerkPayment';
import { ShopifyPerkPayment } from '@thxnetwork/api/models/ShopifyPerkPayment';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import WalletService from '@thxnetwork/api/services/WalletService';
import PerkService from '@thxnetwork/api/services/PerkService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Perks']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const erc20Perks = await ERC20Perk.find({
        poolId: String(pool._id),
        pointPrice: { $exists: true, $gt: 0 },
    });
    const erc721Perks = await ERC721Perk.find({
        poolId: String(pool._id),
        $or: [{ pointPrice: { $exists: true, $gt: 0 } }, { price: { $exists: true, $gt: 0 } }],
    });
    const shopifyPerks = await ShopifyPerk.find({
        poolId: String(pool._id),
        $or: [{ pointPrice: { $exists: true, $gt: 0 } }, { price: { $exists: true, $gt: 0 } }],
    });

    let wallet: WalletDocument, sub: string;

    // This endpoint is public so we do not get req.auth populated and decode the token ourselves
    // when the request is made with an authorization header to obtain the sub.
    const authHeader = req.header('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token: { sub: string } = jwt_decode(authHeader.split(' ')[1]);
        sub = token.sub;

        wallet = await WalletService.findPrimary(sub, pool.chainId);
    }

    res.json({
        erc20Perks: await Promise.all(
            erc20Perks.map(async (r) => {
                const { isError } = await PerkService.validate({ perk: r, sub, pool });
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
                    expiry: await PerkService.getExpiry(r),
                    progress: await PerkService.getProgress(r, ERC20PerkPayment),
                    isLocked: await PerkService.getIsLockedForWallet(r, wallet),
                    tokenGatingContractAddress: r.tokenGatingContractAddress,
                };
            }),
        ),
        erc721Perks: await Promise.all(
            erc721Perks.map(async (r) => {
                const { isError } = await PerkService.validate({ perk: r, sub, pool });
                const nft = await PerkService.getNFT(r);
                const token = !r.metadataId && r.tokenId ? await PerkService.getToken(r) : null;
                const metadata = await PerkService.getMetadata(r, token);

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
                    nft,
                    metadata,
                    erc1155Amount: r.erc1155Amount,
                    expiry: await PerkService.getExpiry(r),
                    progress: await PerkService.getProgress(r, ERC721PerkPayment),
                    isLocked: await PerkService.getIsLockedForWallet(r, wallet),
                    tokenGatingContractAddress: r.tokenGatingContractAddress,
                };
            }),
        ),
        shopifyPerks: await Promise.all(
            shopifyPerks.map(async (r) => {
                const { isError } = await PerkService.validate({ perk: r, sub, pool });
                return {
                    _id: r._id,
                    uuid: r.uuid,
                    title: r.title,
                    description: r.description,
                    pointPrice: r.pointPrice,
                    image: r.image,
                    isPromoted: r.isPromoted,
                    priceRuleId: r.priceRuleId,
                    discountCode: r.discountCode,
                    limit: r.limit,
                    isDisabled: isError,
                    isOwned: false,
                    expiry: await PerkService.getExpiry(r),
                    progress: await PerkService.getProgress(r, ShopifyPerkPayment),
                    isLocked: await PerkService.getIsLockedForWallet(r, wallet),
                    tokenGatingContractAddress: r.tokenGatingContractAddress,
                };
            }),
        ),
    });
};

export default { controller };
