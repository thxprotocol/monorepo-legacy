import express from 'express';
import { assertAssetPoolAccess, assertRequestInput, requireAssetPoolHeader, guard } from '@thxnetwork/api/middlewares';
import CreatePromotion from './post.controller';
import ReadPromotion from './get.controller';
import ListPromotion from './list.controller';
import DeletePromotion from './delete.controller';

const router = express.Router();

router.post(
    '/',
    assertAssetPoolAccess,
    guard.check(['promotions:read', 'promotions:write']),
    assertRequestInput(CreatePromotion.validation),
    requireAssetPoolHeader,
    CreatePromotion.controller,
);
router.get(
    '/',
    assertAssetPoolAccess,
    guard.check(['promotions:read']),
    assertRequestInput(ListPromotion.validation),
    requireAssetPoolHeader,
    ListPromotion.controller,
);
router.get(
    '/:id',
    assertAssetPoolAccess,
    guard.check(['promotions:read']),
    assertRequestInput(ReadPromotion.validation),
    requireAssetPoolHeader,
    ReadPromotion.controller,
);
router.delete(
    '/:id',
    assertAssetPoolAccess,
    guard.check(['promotions:write']),
    assertRequestInput(DeletePromotion.validation),
    requireAssetPoolHeader,
    DeletePromotion.controller,
);

export default router;
