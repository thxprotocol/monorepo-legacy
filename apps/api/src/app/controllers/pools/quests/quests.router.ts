import express from 'express';
import { assertRequestInput, assertPoolAccess, guard } from '@thxnetwork/api/middlewares';
import { upload } from '@thxnetwork/api/util/multer';

import * as ListController from './list.controller';
import * as CreateController from './post.controller';
import * as UpdateController from './patch.controller';
import * as RemoveController from './delete.controller';

import RouterQuestEntries from './entries/entries.router';

const router: express.Router = express.Router({ mergeParams: true });

router.get(
    '/',
    guard.check(['pools:read']),
    upload.single('file'),
    assertPoolAccess,
    assertRequestInput(ListController.validation),
    ListController.controller,
);
router.post(
    '/:variant',
    guard.check(['pools:read', 'pools:write']),
    upload.single('file'),
    assertPoolAccess,
    assertRequestInput(CreateController.validation),
    CreateController.controller,
);
router.patch(
    '/:variant/:questId',
    guard.check(['pools:read', 'pools:write']),
    upload.single('file'),
    assertPoolAccess,
    assertRequestInput(UpdateController.validation),
    UpdateController.controller,
);
router.delete(
    '/:variant/:questId',
    guard.check(['pools:read', 'pools:write']),
    upload.single('file'),
    assertPoolAccess,
    assertRequestInput(RemoveController.validation),
    RemoveController.controller,
);

router.use('/:variant/:questId/entries', RouterQuestEntries);

export default router;
