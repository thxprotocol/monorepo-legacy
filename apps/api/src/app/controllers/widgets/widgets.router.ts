import express, { Router } from 'express';
import { assertPoolAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import * as ReadWidget from './get.controller';
import * as UpdateWidget from './patch.controller';
import * as ListWidgets from './list.controller';

const router: express.Router = express.Router();

router.get('/', guard.check(['widgets:read']), assertPoolAccess, ListWidgets.controller);
router.get(
    '/:uuid',
    guard.check(['widgets:read']),
    assertRequestInput(ReadWidget.validation),
    assertPoolAccess,
    ReadWidget.controller,
);
router.patch(
    '/:uuid',
    guard.check(['widgets:write', 'widgets:read']),
    assertRequestInput(UpdateWidget.validation),
    assertPoolAccess,
    UpdateWidget.controller,
);

export default router;
