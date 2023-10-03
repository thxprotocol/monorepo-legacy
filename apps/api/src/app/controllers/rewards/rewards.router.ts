import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListRewards from './list.controller';
import CreateCoinRewardRedemption from './coin/redemption/post.controller';
import CreateNFTRewardPayment from './nft/payment/post.controller';
import CreateNFTRewardRedemption from './nft/redemption/post.controller';
import CreateRewardCustomRedemption from './custom/redemption/post.controller';
import CreateRewardCouponRedemption from './coupon/redemption/post.controller';

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
        '/nft/:uuid/payment',
        assertRequestInput(CreateNFTRewardPayment.validation),
        CreateNFTRewardPayment.controller,
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

export default router;
