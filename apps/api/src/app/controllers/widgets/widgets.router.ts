import express from 'express';
import { assertAssetPoolOwnership, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
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
    assertAssetPoolOwnership,
    CreateWidget.controller,
);
router.get('/', guard.check(['widgets:read']), assertAssetPoolOwnership, ListWidgets.controller);
router.get(
    '/:uuid',
    guard.check(['widgets:read']),
    assertRequestInput(ReadWidget.validation),
    assertAssetPoolOwnership,
    ReadWidget.controller,
);
router.patch(
    '/:uuid',
    guard.check(['widgets:write', 'widgets:read']),
    assertRequestInput(DeleteWidget.validation),
    assertAssetPoolOwnership,
    UpdateWidget.controller,
);

router.delete(
    '/:uuid',
    guard.check(['widgets:write']),
    assertRequestInput(DeleteWidget.validation),
    assertAssetPoolOwnership,
    DeleteWidget.controller,
);

export default router;
