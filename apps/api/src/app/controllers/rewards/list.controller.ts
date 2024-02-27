import { Request, Response } from 'express';
import jwt_decode from 'jwt-decode';
import { RewardCoin } from '@thxnetwork/api/models/RewardCoin';
import { RewardNFT } from '@thxnetwork/api/models/RewardNFT';
import { RewardNFTPayment } from '@thxnetwork/api/models/RewardNFTPayment';
import { RewardCoinPayment } from '@thxnetwork/api/models/RewardCoinPayment';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import RewardService from '@thxnetwork/api/services/RewardService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { RewardCustomPayment } from '@thxnetwork/api/models/RewardCustomPayment';
import { RewardCouponPayment } from '@thxnetwork/api/models/RewardCouponPayment';
import { CouponCode } from '@thxnetwork/api/models/CouponCode';
import { RewardDiscordRolePayment } from '@thxnetwork/api/models/RewardDiscordRolePayment';
import { AccessTokenKind } from '@thxnetwork/common/enums';
import { Identity } from '@thxnetwork/api/models/Identity';
import LockService from '@thxnetwork/api/services/LockService';
import { RewardCustom, RewardCoupon, RewardDiscordRole } from '@thxnetwork/api/models';

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const [erc20Perks, erc721Perks, customRewards, couponRewards, discordRoleRewards] = await Promise.all([
        RewardCoin.find({
            poolId: String(pool._id),
            pointPrice: { $exists: true, $gt: 0 },
        }),
        RewardNFT.find({
            poolId: String(pool._id),
            $or: [{ pointPrice: { $exists: true, $gt: 0 } }, { price: { $exists: true, $gt: 0 } }],
        }),
        RewardCustom.find({
            poolId: String(pool._id),
            $or: [{ pointPrice: { $exists: true, $gt: 0 } }, { price: { $exists: true, $gt: 0 } }],
        }),
        RewardCoupon.find({
            poolId: String(pool._id),
            $or: [{ pointPrice: { $exists: true, $gt: 0 } }, { price: { $exists: true, $gt: 0 } }],
        }),
        RewardDiscordRole.find({
            poolId: String(pool._id),
            $or: [{ pointPrice: { $exists: true, $gt: 0 } }, { price: { $exists: true, $gt: 0 } }],
        }),
    ]);

    let account: TAccount, sub: string;

    // This endpoint is public so we do not get req.auth populated and decode the token ourselves
    // when the request is made with an authorization header to obtain the sub.
    const authHeader = req.header('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token: { sub: string } = jwt_decode(authHeader.split(' ')[1]);
        sub = token.sub;
        account = await AccountProxy.findById(sub);
    }

    const getRewardDefaults = async (r, Model) => {
        return {
            _id: r._id,
            uuid: r.uuid,
            title: r.title,
            description: r.description,
            image: r.image,
            pointPrice: r.pointPrice,
            isPromoted: r.isPromoted,
            locks: r.locks,
            expiry: await RewardService.getExpiry(r),
            progress: await RewardService.getProgress(r, Model),
            isLocked: await LockService.getIsLocked(r.locks, account),
            tokenGatingContractAddress: r.tokenGatingContractAddress,
        };
    };

    res.json({
        coin: await Promise.all(
            erc20Perks.map(async (r) => {
                const { isError } = await RewardService.validate({ reward: r, account, pool });
                const defaults = await getRewardDefaults(r, RewardCoinPayment);
                const erc20 = await ERC20Service.getById(r.erc20Id);
                return {
                    ...defaults,
                    chainId: erc20.chainId,
                    amount: r.amount,
                    isDisabled: isError,
                    isOwned: false,
                    erc20,
                };
            }),
        ),
        nft: await Promise.all(
            erc721Perks.map(async (r) => {
                const { isError } = await RewardService.validate({ reward: r, account, pool });
                const nft = await RewardService.getNFT(r);
                const token = !r.metadataId && r.tokenId ? await RewardService.getToken(r) : null;
                const metadata = await RewardService.getMetadata(r, token);
                const defaults = await getRewardDefaults(r, RewardNFTPayment);

                return {
                    ...defaults,
                    nft,
                    metadata,
                    chainId: nft.chainId,
                    erc1155Amount: r.erc1155Amount,
                    isDisabled: isError,
                    isOwned: false,
                };
            }),
        ),
        custom: await Promise.all(
            customRewards.map(async (r) => {
                const { isError } = await RewardService.validate({ reward: r, account, pool });
                const defaults = await getRewardDefaults(r, RewardCustomPayment);
                // @dev Having an Identity for this pool is required in order for the external system to target the right user
                const identities = sub ? await Identity.find({ poolId: pool._id, account }) : [];
                return {
                    ...defaults,
                    isDisabled: isError || !identities.length,
                    isOwned: false,
                };
            }),
        ),
        coupon: await Promise.all(
            couponRewards.map(async (r) => {
                // Set limit here since it is not stored in the reward but obtained
                // from the amount of coupon codes instead
                const codes = await CouponCode.find({ couponRewardId: String(r._id) });
                r.limit = codes.length;

                const { isError, errorMessage } = await RewardService.validate({ reward: r, account, pool });
                const defaults = await getRewardDefaults(r, RewardCouponPayment);

                return { ...defaults, isDisabled: isError, errorMessage, isOwned: false };
            }),
        ),
        discordRole: await Promise.all(
            discordRoleRewards.map(async (r) => {
                const { isError, errorMessage } = await RewardService.validate({ reward: r, account, pool });
                const defaults = await getRewardDefaults(r, RewardDiscordRolePayment);
                const token = account && account.tokens.find(({ kind }) => kind === AccessTokenKind.Discord);

                return { ...defaults, isDisabled: !token || isError, errorMessage, isOwned: false };
            }),
        ),
    });
};

export default { controller };
