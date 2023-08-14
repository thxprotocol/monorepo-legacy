import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListPerks from './list.controller';
import PayERC20Perk from './erc20/redemption/post.controller';
import ERC721PerkPayment from './erc721/payment/post.controller';
import ERC721PerkRedemption from './erc721/redemption/post.controller';
import CustomRewardRedemption from './custom/redemption/post.controller';

const router = express.Router();

router.get('/', ListPerks.controller);

router
    .use(checkJwt)
    .use(corsHandler)
    .post('/erc20/:uuid/redemption', assertRequestInput(PayERC20Perk.validation), PayERC20Perk.controller);
router
    .use(checkJwt)
    .use(corsHandler)
    .post(
        '/erc721/:uuid/redemption',
        assertRequestInput(ERC721PerkRedemption.validation),
        ERC721PerkRedemption.controller,
    );
router
    .use(checkJwt)
    .use(corsHandler)
    .post('/erc721/:uuid/payment', assertRequestInput(ERC721PerkPayment.validation), ERC721PerkPayment.controller);
router
    .use(checkJwt)
    .use(corsHandler)
    .post(
        '/custom/:uuid/redemption',
        assertRequestInput(CustomRewardRedemption.validation),
        CustomRewardRedemption.controller,
    );

export default router;
