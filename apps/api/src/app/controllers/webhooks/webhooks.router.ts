import express from 'express';
import { assertAssetPoolOwnership, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import ListWebhook from './list.controller';
import PatchWebhook from './patch.controller';
import CreateWebhook from './post.controller';
import DeleteWebhook from './delete.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['webhooks:read']),
    assertAssetPoolOwnership,
    assertRequestInput(ListWebhook.validation),
    ListWebhook.controller,
);
router.patch(
    '/:id',
    guard.check(['webhooks:read']),
    assertAssetPoolOwnership,
    assertRequestInput(PatchWebhook.validation),
    PatchWebhook.controller,
);
router.post(
    '/',
    guard.check(['webhooks:write', 'webhooks:read']),
    assertAssetPoolOwnership,
    assertRequestInput(CreateWebhook.validation),
    CreateWebhook.controller,
);
router.delete(
    '/:id',
    guard.check(['webhooks:write', 'webhooks:read']),
    assertAssetPoolOwnership,
    assertRequestInput(DeleteWebhook.validation),
    DeleteWebhook.controller,
);

export default router;
