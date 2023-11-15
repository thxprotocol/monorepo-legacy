import { Request, Response } from 'express';
import { ChainId } from '@thxnetwork/types/enums';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { DiscordRoleRewardPayment } from '@thxnetwork/api/models/DiscordRoleRewardPayment';
import { DiscordRoleReward } from '@thxnetwork/api/models/DiscordRoleReward';
import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [query('chainId').exists().isNumeric()];

const controller = async (req: Request, res: Response) => {
    const chainId = Number(req.query.chainId) as ChainId;
    const wallet = await SafeService.findPrimary(req.auth.sub, chainId);
    if (!wallet) throw new NotFoundError('Could not find the wallet for the user');

    const discordRoleRewardPayments = await DiscordRoleRewardPayment.find({ walletId: wallet._id });
    const discordRoleRewards = await Promise.all(
        discordRoleRewardPayments.map(async (p) => {
            const reward = await DiscordRoleReward.findById(p.perkId);
            const guild = await DiscordGuild.findOne({ poolId: reward.poolId });
            const role = guild.roles.find((role) => role.id === reward.discordRoleId);
            return { ...p.toJSON(), reward, guild, role };
        }),
    );

    res.json(discordRoleRewards);
};

export default { controller, validation };
