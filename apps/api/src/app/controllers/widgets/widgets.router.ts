import express from 'express';
import { assertAssetPoolOwnership, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import ReadWidget from './get.controller';
import UpdateWidget from './patch.controller';
import ListWidgets from './list.controller';

const router = express.Router();

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
    assertRequestInput(UpdateWidget.validation),
    assertAssetPoolOwnership,
    UpdateWidget.controller,
);

export default router;
