import express, { Router } from 'express';
import { assertPoolAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import * as ListWebhook from './list.controller';
import * as PatchWebhook from './patch.controller';
import * as CreateWebhook from './post.controller';
import * as DeleteWebhook from './delete.controller';

const router: express.Router = express.Router();

router.get(
    '/',
    guard.check(['webhooks:read']),
    assertPoolAccess,
    assertRequestInput(ListWebhook.validation),
    ListWebhook.controller,
);
router.patch(
    '/:id',
    guard.check(['webhooks:read']),
    assertPoolAccess,
    assertRequestInput(PatchWebhook.validation),
    PatchWebhook.controller,
);
router.post(
    '/',
    guard.check(['webhooks:write', 'webhooks:read']),
    assertPoolAccess,
    assertRequestInput(CreateWebhook.validation),
    CreateWebhook.controller,
);
router.delete(
    '/:id',
    guard.check(['webhooks:write', 'webhooks:read']),
    assertPoolAccess,
    assertRequestInput(DeleteWebhook.validation),
    DeleteWebhook.controller,
);

export default router;
