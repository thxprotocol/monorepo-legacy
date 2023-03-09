import express from 'express';
import { assertAssetPoolOwnership, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import CreateShopifyPerk from './post.controller';
import ReadShopifyPerk from './get.controller';
import UpdateShopifyPerk from './patch.controller';
import ListShopifyPerk from './list.controller';
import ListShopifyPriceRules from './price-rules/list.controller';
import DeleteShopifyPerk from './delete.controller';
import ListShopifyDiscountCodes from './discount-codes/list.controller';
import { upload } from '@thxnetwork/api/util/multer';

const router = express.Router();
router.get(
    '/price-rules',
    guard.check(['shopify_rewards:read']),
    assertAssetPoolOwnership,
    ListShopifyPriceRules.controller,
);
router.get(
    '/discount-codes',
    guard.check(['shopify_rewards:read']),
    assertAssetPoolOwnership,
    ListShopifyDiscountCodes.controller,
);
router.get('/', guard.check(['shopify_rewards:read']), assertAssetPoolOwnership, ListShopifyPerk.controller);
router.get(
    '/:id',
    guard.check(['shopify_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(ReadShopifyPerk.validation),
    ReadShopifyPerk.controller,
);

router.post(
    '/',
    upload.single('file'),
    guard.check(['shopify_rewards:write', 'shopify_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(CreateShopifyPerk.validation),
    CreateShopifyPerk.controller,
);

router.patch(
    '/:id',
    upload.single('file'),
    guard.check(['shopify_rewards:write', 'shopify_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(UpdateShopifyPerk.validation),
    UpdateShopifyPerk.controller,
);

router.delete(
    '/:id',
    guard.check(['shopify_rewards:write', 'shopify_rewards:read']),
    assertAssetPoolOwnership,
    assertRequestInput(DeleteShopifyPerk.validation),
    DeleteShopifyPerk.controller,
);

export default router;
