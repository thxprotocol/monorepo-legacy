import express from 'express';
import { assertRequestInput, assertPoolAccess, guard } from '@thxnetwork/api/middlewares';

import ListController from './list.controller';
import ReadController from './get.controller';
import CreateController from './post.controller';
import UpdateController from './patch.controller';
import DeleteController from './delete.controller';

import RouterSubscriptions from './subscriptions/subscriptions.router';
import RouterCollaborators from './collaborators/collaborators.router';
import RouterParticipants from './participants/participants.router';
import RouterEvents from './events/events.router';
import RouterQuests from './quests/quests.router';
import RouterGuilds from './guilds/guilds.router';
import RouterTopups from './topup/topup.router';
import RouterWallets from './wallets/wallets.router';
import RouterTransfers from './transfers/transfers.router';

const router = express.Router({ mergeParams: true });

router.get('/', guard.check(['pools:read']), assertRequestInput(ListController.validation), ListController.controller);
router.get(
    '/:id',
    guard.check(['pools:read']),
    assertPoolAccess,
    assertRequestInput(ReadController.validation),
    ReadController.controller,
);
router.post(
    '/',
    guard.check(['pools:read', 'pools:write']),
    assertRequestInput(CreateController.validation),
    CreateController.controller,
);
router.patch(
    '/:id',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(UpdateController.validation),
    UpdateController.controller,
);
router.delete(
    '/:id',
    guard.check(['pools:write']),
    assertPoolAccess,
    assertRequestInput(DeleteController.validation),
    DeleteController.controller,
);
router.use('/:id/subscription', RouterSubscriptions); // TODO Should not be in /pools but root resource instead
router.use('/:id/collaborators', RouterCollaborators);
router.use('/:id/participants', RouterParticipants);
router.use('/:id/topup', RouterTopups);
router.use('/:id/transfers', RouterTransfers);
router.use('/:id/wallets', RouterWallets);
router.use('/:id/quests', RouterQuests);
router.use('/:id/events', RouterEvents);
router.use('/:id/guilds', RouterGuilds);

export default router;
