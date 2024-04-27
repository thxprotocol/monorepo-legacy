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
import RouterPayments from './payments/payments.router';
import RouterWallets from './wallets/wallets.router';
import RouterERC20 from './erc20/erc20.router';
import RouterER1155 from './erc1155/erc1155.router';
import RouterIdentities from './identities/identities.router';
import RouterInvoices from './invoices/invoices.router';
import RouterIntegrations from './integrations/integrations.router';

const router = express.Router({ mergeParams: true });

router.get('/', guard.check(['pools:read']), assertRequestInput(ListController.validation), ListController.controller);
router.post(
    '/',
    guard.check(['pools:read', 'pools:write']),
    assertRequestInput(CreateController.validation),
    CreateController.controller,
);

// This route is also asserted for payment but not for access
router.use('/:id/collaborators', assertPayment, RouterCollaborators);

// Everything below is asserted for campaign/pool access
router.use('/:id', assertPoolAccess);
router.get(
    '/:id',
    guard.check(['pools:read']),
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

// Payment related routes that require access event if payment assertion fails
router.use('/:id/erc20', RouterERC20); // Needed for payment processing
router.use('/:id/payments', RouterPayments);
router.use('/:id/invoices', RouterInvoices);

// Everything below is asserted for payment
router.use('/:id', assertPayment);
router.use('/:id/analytics', RouterAnalytics);
router.use('/:id/quests', RouterQuests);
router.use('/:id/rewards', RouterRewards);
router.use('/:id/participants', RouterParticipants);
router.use('/:id/wallets', RouterWallets);
router.use('/:id/events', RouterEvents);
router.use('/:id/guilds', RouterGuilds);
router.use('/:id/erc1155', RouterER1155);
router.use('/:id/identities', RouterIdentities);
router.use('/:id/integrations', RouterIntegrations);

export default router;
