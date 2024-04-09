import express from 'express';
import { assertRequestInput, assertPoolAccess, assertPayment, guard } from '@thxnetwork/api/middlewares';

import ListController from './list.controller';
import ReadController from './get.controller';
import CreateController from './post.controller';
import UpdateController from './patch.controller';
import DeleteController from './delete.controller';

import RouterCollaborators from './collaborators/collaborators.router';
import RouterParticipants from './participants/participants.router';
import RouterAnalytics from './analytics/analytics.router';
import RouterEvents from './events/events.router';
import RouterQuests from './quests/quests.router';
import RouterRewards from './rewards/rewards.router';
import RouterGuilds from './guilds/guilds.router';
import RouterTopups from './topup/topup.router';
import RouterWallets from './wallets/wallets.router';
import RouterERC20 from './erc20/erc20.router';
import RouterER1155 from './erc1155/erc1155.router';
import RouterIdentities from './identities/identities.router';
import RouterInvoices from './invoices/invoices.router';

const router = express.Router({ mergeParams: true });

router.get('/', guard.check(['pools:read']), assertRequestInput(ListController.validation), ListController.controller);
router.post(
    '/',
    guard.check(['pools:read', 'pools:write']),
    assertRequestInput(CreateController.validation),
    CreateController.controller,
);
router.use('/:id/collaborators', RouterCollaborators);
router.use('/:id', assertPoolAccess);
router.get(
    '/:id',
    guard.check(['pools:read']),
    assertPayment,
    assertRequestInput(ReadController.validation),
    ReadController.controller,
);
router.patch(
    '/:id',
    guard.check(['pools:read', 'pools:write']),
    assertRequestInput(UpdateController.validation),
    UpdateController.controller,
);
router.delete(
    '/:id',
    guard.check(['pools:write']),
    assertRequestInput(DeleteController.validation),
    DeleteController.controller,
);

router.use('/:id/participants', RouterParticipants);
router.use('/:id/analytics', RouterAnalytics);
router.use('/:id/topup', RouterTopups);
router.use('/:id/wallets', RouterWallets);
router.use('/:id/quests', RouterQuests);
router.use('/:id/rewards', RouterRewards);
router.use('/:id/events', RouterEvents);
router.use('/:id/guilds', RouterGuilds);
router.use('/:id/erc20', RouterERC20);
router.use('/:id/erc1155', RouterER1155);
router.use('/:id/identities', RouterIdentities);
router.use('/:id/invoices', RouterInvoices);

export default router;
