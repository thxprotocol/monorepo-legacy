import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListRewards from './list.controller';
import CreateCoinRewardRedemption from './coin/redemption/post.controller';
import CreateNFTRewardRedemption from './nft/redemption/post.controller';
import CreateRewardCustomRedemption from './custom/redemption/post.controller';
import CreateRewardCouponRedemption from './coupon/redemption/post.controller';
import CreateRewardDiscordRoleRedemption from './discord-role/redemption/post.controller';

const router = express.Router();

router.get('/', ListRewards.controller);

router.use(checkJwt, corsHandler);
router.post(
    '/coin/:id/payment',
    assertRequestInput(CreateCoinRewardRedemption.validation),
    CreateCoinRewardRedemption.controller,
);
router.post(
    '/nft/:id/payment',
    assertRequestInput(CreateNFTRewardRedemption.validation),
    CreateNFTRewardRedemption.controller,
);
router.post(
    '/custom/:id/payment',
    assertRequestInput(CreateRewardCustomRedemption.validation),
    CreateRewardCustomRedemption.controller,
);
router.post(
    '/coupon/:id/payment',
    assertRequestInput(CreateRewardCouponRedemption.validation),
    CreateRewardCouponRedemption.controller,
);
router.post(
    '/discord-role/:id/payment',
    assertRequestInput(CreateRewardDiscordRoleRedemption.validation),
    CreateRewardDiscordRoleRedemption.controller,
);

export default router;
