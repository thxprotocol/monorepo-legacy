import { assertRequestInput, checkJwt, corsHandler, guard } from '@thxnetwork/api/middlewares';
import express from 'express';
import ListPerks from './list.controller';
import PayERC20Perk from './erc20/redemption/post.controller';
import ERC721PerkPayment from './erc721/payment/post.controller';
import ERC721PerkRedemption from './erc721/redemption/post.controller';
import ShopifyPerkPayment from './shopify/payment/post.controller';
import ShopifyPerkRedemption from './shopify/redemption/post.controller';
import ListShopifyDiscountCodes from './shopify/discount-codes/list.controller';

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

router.use(checkJwt).use(corsHandler).post(
    '/shopify/:uuid/redemption',
    // guard.check(['perks_redeem:read']),
    assertRequestInput(ShopifyPerkRedemption.validation),
    ShopifyPerkRedemption.controller,
);
router.use(checkJwt).use(corsHandler).post(
    '/shopify/:uuid/payment',
    // guard.check(['perks_redeem:read']),
    assertRequestInput(ShopifyPerkPayment.validation),
    ShopifyPerkPayment.controller,
);

router.get('/shopify/discount-codes', ListShopifyDiscountCodes.controller);

export default router;
