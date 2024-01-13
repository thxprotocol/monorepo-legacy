import express from 'express';
import { assertRequestInput, assertPoolAccess, guard, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';

import ListController from './list.controller';
import ReadController from './get.controller';
import CreateController from './post.controller';
import UpdateController from './patch.controller';
import DeleteController from './delete.controller';

import ReadPoolTransfer from './transfers/get.controller';
import CreatePoolTransfer from './transfers/post.controller';
import DeletePoolTransfer from './transfers/delete.controller';
import CreatePoolTransferRefresh from './transfers/refresh/post.controller';
import ListPoolTransfer from './transfers/list.controller';

import ListPoolsPublic from './public/list.controller';
import CreatePoolTopup from './topup/post.controller';
import ListPoolWallets from './wallets/list.controller';

import routerSubscriptions from './subscriptions/subscriptions.router';
import routerCollaborators from './collaborators/collaborators.router';
import routerParticipants from './participants/participants.router';
import routerEvents from './events/events.router';
import routerQuests from './quests/quests.router';
import routerGuilds from './guilds/guilds.router';

const router = express.Router();

router.get(
    '/:id/wallets',
    checkJwt,
    corsHandler,
    guard.check(['pools:read']),
    assertPoolAccess,
    assertRequestInput(ListPoolWallets.validation),
    ListPoolWallets.controller,
);

// RESOURCE transfers
router.post(
    '/:id/transfers',
    checkJwt,
    corsHandler,
    guard.check(['pools:write']),
    assertRequestInput(CreatePoolTransfer.validation),
    CreatePoolTransfer.controller,
);
router.delete(
    '/:id/transfers',
    checkJwt,
    corsHandler,
    guard.check(['pools:write']),
    assertPoolAccess,
    assertRequestInput(DeletePoolTransfer.validation),
    DeletePoolTransfer.controller,
);
router.get('/:id/transfers/:token', assertRequestInput(ReadPoolTransfer.validation), ReadPoolTransfer.controller);
router.get(
    '/:id/transfers',
    checkJwt,
    corsHandler,
    guard.check(['pools:read']),
    assertPoolAccess,
    assertRequestInput(ListPoolTransfer.validation),
    ListPoolTransfer.controller,
);
router.post(
    '/:id/transfers/refresh',
    checkJwt,
    corsHandler,
    guard.check(['pools:write']),
    assertPoolAccess,
    assertRequestInput(CreatePoolTransferRefresh.validation),
    CreatePoolTransferRefresh.controller,
);
// END

// TODO Should move to campaign ranking resource
router.get('/public', assertRequestInput(ListPoolsPublic.validation), ListPoolsPublic.controller);

// RESOURCE topup
router.post(
    '/:id/topup',
    checkJwt,
    corsHandler,
    guard.check(['deposits:read', 'deposits:write']),
    assertPoolAccess,
    assertRequestInput(CreatePoolTopup.validation),
    CreatePoolTopup.controller,
);
// END

// RESOURCE Campaigns (Pools)
router.get(
    '/',
    checkJwt,
    corsHandler,
    guard.check(['pools:read']),
    assertRequestInput(ListController.validation),
    ListController.controller,
);
router.get(
    '/:id',
    checkJwt,
    corsHandler,
    guard.check(['pools:read']),
    assertPoolAccess,
    assertRequestInput(ReadController.validation),
    ReadController.controller,
);
router.post(
    '/',
    checkJwt,
    corsHandler,
    guard.check(['pools:read', 'pools:write']),
    assertRequestInput(CreateController.validation),
    CreateController.controller,
);
router.patch(
    '/:id',
    checkJwt,
    corsHandler,
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(UpdateController.validation),
    UpdateController.controller,
);
router.delete(
    '/:id',
    checkJwt,
    corsHandler,
    guard.check(['pools:write']),
    assertPoolAccess,
    assertRequestInput(DeleteController.validation),
    DeleteController.controller,
);
// RESOURCE END

router.use(checkJwt, corsHandler, guard.check(['pools:read', 'pools:write']));

router.use('/:id/subscription', routerSubscriptions);
router.use('/:id/collaborators', routerCollaborators);
router.use('/:id/participants', routerParticipants);
router.use('/:id/quests', routerQuests);
router.use('/:id/events', routerEvents);
router.use('/:id/guilds', routerGuilds);

export default router;
