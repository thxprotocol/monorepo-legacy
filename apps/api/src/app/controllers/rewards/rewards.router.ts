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

router
    .use(checkJwt)
    .use(corsHandler)
    .post(
        '/coin/:uuid/redemption',
        assertRequestInput(CreateCoinRewardRedemption.validation),
        CreateCoinRewardRedemption.controller,
    );
router
    .use(checkJwt)
    .use(corsHandler)
    .post(
        '/nft/:uuid/redemption',
        assertRequestInput(CreateNFTRewardRedemption.validation),
        CreateNFTRewardRedemption.controller,
    );
router
    .use(checkJwt)
    .use(corsHandler)
    .post(
        '/custom/:uuid/redemption',
        assertRequestInput(CreateRewardCustomRedemption.validation),
        CreateRewardCustomRedemption.controller,
    );
router
    .use(checkJwt)
    .use(corsHandler)
    .post(
        '/coupon/:uuid/redemption',
        assertRequestInput(CreateRewardCouponRedemption.validation),
        CreateRewardCouponRedemption.controller,
    );
router
    .use(checkJwt)
    .use(corsHandler)
    .post(
        '/discord-role/:uuid/redemption',
        assertRequestInput(CreateRewardDiscordRoleRedemption.validation),
        CreateRewardDiscordRoleRedemption.controller,
    );

export default router;
