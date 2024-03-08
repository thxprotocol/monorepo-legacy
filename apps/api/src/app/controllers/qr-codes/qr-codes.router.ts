import express from 'express';
import { assertRequestInput, checkJwt, corsHandler, guard } from '@thxnetwork/api/middlewares';
import ListEntry from './list.controller';
import CreateEntry from './post.controller';
import ReadEntry from './get.controller';
import DeleteEntryController from './delete.controller';
import ReadRedirectEntry from './redirect/get.controller';
import UpdateEntryController from './collect/post.controller';

const router = express.Router();

router.get('/:uuid', assertRequestInput(ReadEntry.validation), ReadEntry.controller);
router.get('/r/:uuid', assertRequestInput(ReadRedirectEntry.validation), ReadRedirectEntry.controller);

router.use(checkJwt, corsHandler);
router.get('/', guard.check(['pools:read']), assertRequestInput(ListEntry.validation), ListEntry.controller);
router.post('/', guard.check(['pools:read']), assertRequestInput(CreateEntry.validation), CreateEntry.controller);

router.patch(
    '/:uuid',
    guard.check(['claims:read']),
    assertRequestInput(UpdateEntryController.validation),
    UpdateEntryController.controller,
);

router.delete(
    '/:uuid',
    guard.check(['pools:write']),
    assertRequestInput(DeleteEntryController.validation),
    DeleteEntryController.controller,
);

export default router;
