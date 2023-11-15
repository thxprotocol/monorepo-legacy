import { assertPoolAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import { upload } from '@thxnetwork/api/util/multer';
import express from 'express';
import ListDiscordRoleReward from './list.controller';
import ListCouponCodePayments from './payments/list.controller';
import CreateDiscordRoleReward from './post.controller';
import UpdateDiscordRoleReward from './patch.controller';
import RemoveDiscordRoleReward from './delete.controller';

const router = express.Router();

router.get(
    '/',
    guard.check(['discord_role_rewards:read']),
    assertPoolAccess,
    assertRequestInput(ListDiscordRoleReward.validation),
    ListDiscordRoleReward.controller,
);

router.get('/payments', ListCouponCodePayments.controller);

router.patch(
    '/:id',
    upload.single('file'),
    guard.check(['discord_role_rewards:write', 'discord_role_rewards:read']),
    assertPoolAccess,
    assertRequestInput(UpdateDiscordRoleReward.validation),
    UpdateDiscordRoleReward.controller,
);
router.post(
    '/',
    upload.single('file'),
    guard.check(['discord_role_rewards:write', 'discord_role_rewards:read']),
    assertPoolAccess,
    assertRequestInput(CreateDiscordRoleReward.validation),
    CreateDiscordRoleReward.controller,
);
router.delete(
    '/:id',
    guard.check(['discord_role_rewards:write']),
    assertPoolAccess,
    assertRequestInput(RemoveDiscordRoleReward.validation),
    RemoveDiscordRoleReward.controller,
);

export default router;
