import { Request, Response } from 'express';
import { query } from 'express-validator';
import { DiscordRoleRewardPayment } from '@thxnetwork/api/models/DiscordRoleRewardPayment';
import { DiscordRoleReward } from '@thxnetwork/api/models/DiscordRoleReward';
import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';

const validation = [query('chainId').exists().isNumeric()];

const controller = async (req: Request, res: Response) => {
    const payments = await DiscordRoleRewardPayment.find({ sub: req.auth.sub });
    const rewards = await Promise.all(
        payments.map(async (p) => {
            const reward = await DiscordRoleReward.findById(p.perkId);
            const guild = await DiscordGuild.findOne({ poolId: reward.poolId });
            const role = guild.roles.find((role) => role.id === reward.discordRoleId);
            return { ...p.toJSON(), reward, guild, role };
        }),
    );

    res.json(rewards);
};

export default { controller, validation };
