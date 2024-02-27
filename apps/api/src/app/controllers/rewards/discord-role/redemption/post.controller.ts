import { Request, Response } from 'express';
import { param } from 'express-validator';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import MailService from '@thxnetwork/api/services/MailService';
import RewardService from '@thxnetwork/api/services/RewardService';
import { RewardDiscordRolePayment } from '@thxnetwork/api/models/RewardDiscordRolePayment';
import { client } from 'apps/api/src/discord';
import { AccessTokenKind } from '@thxnetwork/common/enums';
import { Participant } from '@thxnetwork/api/models/Participant';
import { RewardDiscordRole, DiscordGuild } from '@thxnetwork/api/models';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.header('X-PoolId'));

    const reward = await RewardDiscordRole.findById(req.params.id);
    if (!reward) throw new NotFoundError('Could not find this reward');
    if (!reward.pointPrice) throw new NotFoundError('No point price for this reward has been set.');

    const account = await AccountProxy.findById(req.auth.sub);
    const participant = await Participant.findOne({ sub: account.sub, poolId: pool._id });
    if (!participant || Number(participant.balance) < Number(reward.pointPrice)) {
        throw new BadRequestError('Not enough points on this account for this payment');
    }

    const redeemValidationResult = await RewardService.validate({ reward: reward, account, pool });
    if (redeemValidationResult.isError) {
        throw new ForbiddenError(redeemValidationResult.errorMessage);
    }

    // Give role to user
    const discordGuild = await DiscordGuild.findOne({ poolId: reward.poolId });
    if (!discordGuild) {
        throw new ForbiddenError(`THX Bot is not invited to the ${discordGuild.name} Discord server`);
    }
    const guild = await client.guilds.fetch(discordGuild.guildId);
    const token = account.tokens.find(({ kind }) => kind === AccessTokenKind.Discord);
    if (!token) {
        throw new ForbiddenError('Your account is not connected to a Discord account');
    }

    const member = await guild.members.fetch(token.userId);
    if (!member) {
        throw new ForbiddenError(`You are not a member of the ${discordGuild.name} Discord server`);
    }

    const role = guild.roles.cache.find((r) => r.id === reward.discordRoleId);
    if (!role) throw new ForbiddenError('Could not find role in server');

    await member.roles.add(role);

    const payment = await RewardDiscordRolePayment.create({
        rewardId: reward._id,
        discordRoleId: reward.discordRoleId,
        sub: req.auth.sub,
        poolId: reward.poolId,
        amount: reward.pointPrice,
    });

    await PointBalanceService.subtract(pool, account, reward.pointPrice);

    let html = `<p style="font-size: 18px">Congratulations!🚀</p>`;
    html += `<p>Your point redemption has been received and a Discord Role Reward has been created for you!</p>`;
    html += `<p class="btn"><a href="${pool.campaignURL}">View Wallet</a></p>`;

    await MailService.send(account.email, `🎁 Discord Role Reward Received!"`, html);

    res.status(201).json({ discordRoleRewardPayment: payment });
};

export default { controller, validation };
