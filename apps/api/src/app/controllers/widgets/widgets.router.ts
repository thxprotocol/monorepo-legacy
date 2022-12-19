import express from 'express';
import { assertAssetPoolAccess, assertRequestInput, guard, requireAssetPoolHeader } from '@thxnetwork/api/middlewares';
import CreateWidget from './post.controller';
import ReadWidget from './get.controller';
import UpdateWidget from './patch.controller';
import DeleteWidget from './delete.controller';
import ListWidgets from './list.controller';

const router = express.Router();

router.post(
    '/',
    guard.check(['widgets:write', 'widgets:read']),
    assertRequestInput(CreateWidget.validation),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    CreateWidget.controller,
);
router.get('/', guard.check(['widgets:read']), assertAssetPoolAccess, requireAssetPoolHeader, ListWidgets.controller);
router.get(
    '/:uuid',
    guard.check(['widgets:read']),
    assertRequestInput(ReadWidget.validation),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    ReadWidget.controller,
);
router.patch(
    '/:uuid',
    guard.check(['widgets:write', 'widgets:read']),
    assertRequestInput(DeleteWidget.validation),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    UpdateWidget.controller,
);

router.delete(
    '/:uuid',
    guard.check(['widgets:write']),
    assertRequestInput(DeleteWidget.validation),
    assertAssetPoolAccess,
    requireAssetPoolHeader,
    DeleteWidget.controller,
);

export default router;
