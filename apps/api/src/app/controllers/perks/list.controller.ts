import { Request, Response } from 'express';
import jwt_decode from 'jwt-decode';
import { ERC20Perk } from '@thxnetwork/api/models/ERC20Perk';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import { ERC721PerkPayment } from '@thxnetwork/api/models/ERC721PerkPayment';
import { ERC20PerkPayment } from '@thxnetwork/api/models/ERC20PerkPayment';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import WalletService from '@thxnetwork/api/services/WalletService';
import PerkService from '@thxnetwork/api/services/PerkService';
import { CustomReward } from '@thxnetwork/api/models/CustomReward';
import { Wallet } from '@thxnetwork/api/models/Wallet';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Perks']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const [erc20Perks, erc721Perks, customRewards] = await Promise.all([
        ERC20Perk.find({
            poolId: String(pool._id),
            pointPrice: { $exists: true, $gt: 0 },
        }),
        ERC721Perk.find({
            poolId: String(pool._id),
            $or: [{ pointPrice: { $exists: true, $gt: 0 } }, { price: { $exists: true, $gt: 0 } }],
        }),
        CustomReward.find({
            poolId: String(pool._id),
            $or: [{ pointPrice: { $exists: true, $gt: 0 } }, { price: { $exists: true, $gt: 0 } }],
        }),
    ]);

    let wallet: WalletDocument, sub: string;

    // This endpoint is public so we do not get req.auth populated and decode the token ourselves
    // when the request is made with an authorization header to obtain the sub.
    const authHeader = req.header('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token: { sub: string } = jwt_decode(authHeader.split(' ')[1]);
        sub = token.sub;

        wallet = await WalletService.findPrimary(sub, pool.chainId);
    }

    const getRewardDefeaults = async (r, Model) => {
        return {
            _id: r._id,
            uuid: r.uuid,
            title: r.title,
            description: r.description,
            image: r.image,
            pointPrice: r.pointPrice,
            isPromoted: r.isPromoted,
            expiry: await PerkService.getExpiry(r),
            progress: await PerkService.getProgress(r, Model),
            isLocked: await PerkService.getIsLockedForWallet(r, wallet),
            tokenGatingContractAddress: r.tokenGatingContractAddress,
        };
    };

    res.json({
        erc20Perks: await Promise.all(
            erc20Perks.map(async (r) => {
                const { isError } = await PerkService.validate({ perk: r, sub, pool });
                const defaults = await getRewardDefeaults(r, ERC20PerkPayment);
                return {
                    ...defaults,
                    isDisabled: isError,
                    isOwned: false,
                    erc20: await ERC20Service.getById(r.erc20Id),
                };
            }),
        ),
        erc721Perks: await Promise.all(
            erc721Perks.map(async (r) => {
                const { isError } = await PerkService.validate({ perk: r, sub, pool });
                const nft = await PerkService.getNFT(r);
                const token = !r.metadataId && r.tokenId ? await PerkService.getToken(r) : null;
                const metadata = await PerkService.getMetadata(r, token);
                const defaults = await getRewardDefeaults(r, ERC721PerkPayment);

                return {
                    ...defaults,
                    nft,
                    metadata,
                    erc1155Amount: r.erc1155Amount,
                    price: r.price,
                    priceCurrency: r.priceCurrency,
                    isDisabled: isError,
                    isOwned: false,
                };
            }),
        ),
        customRewards: await Promise.all(
            customRewards.map(async (r) => {
                const { isError } = await PerkService.validate({ perk: r, sub, pool });
                const defaults = await getRewardDefeaults(r, ERC721PerkPayment); // TOOD Implement CustomRewardPayment
                const wallets = sub ? await Wallet.find({ poolId: pool._id, sub, uuid: { $exists: true } }) : [];
                return {
                    ...defaults,
                    isDisabled: isError || !wallets.length,
                    isOwned: false,
                };
            }),
        ),
    });
};

export default { controller };
