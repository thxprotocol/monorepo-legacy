import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListPerks from './list.controller';
import PayERC20Perk from './erc20/redemption/post.controller';
import ERC721PerkPayment from './erc721/payment/post.controller';
import ERC721PerkRedemption from './erc721/redemption/post.controller';

const router = express.Router();

router.get('/', ListPerks.controller);

router.use(checkJwt).use(corsHandler).post(
    '/erc20/:uuid/redemption',
    // guard.check(['perks_redeem:read']),
    assertRequestInput(PayERC20Perk.validation),
    PayERC20Perk.controller,
);

router.use(checkJwt).use(corsHandler).post(
    '/erc721/:uuid/redemption',
    // guard.check(['perks_redeem:read']),
    assertRequestInput(ERC721PerkRedemption.validation),
    ERC721PerkRedemption.controller,
);
router.use(checkJwt).use(corsHandler).post(
    '/erc721/:uuid/payment',
    // guard.check(['perks_redeem:read']),
    assertRequestInput(ERC721PerkPayment.validation),
    ERC721PerkPayment.controller,
);

export default router;
