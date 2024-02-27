import { Request, Response } from 'express';
import { query } from 'express-validator';
import { DiscordGuild, RewardDiscordRole, RewardDiscordRolePayment } from '@thxnetwork/api/models';

const validation = [query('chainId').exists().isNumeric()];

const controller = async (req: Request, res: Response) => {
    const payments = await RewardDiscordRolePayment.find({ sub: req.auth.sub });
    const rewards = await Promise.all(
        payments.map(async (p) => {
            const reward = await RewardDiscordRole.findById(p.rewardId);
            const guild = await DiscordGuild.findOne({ poolId: reward.poolId });
            const role = guild.roles.find((role) => role.id === reward.discordRoleId);
            return { ...p.toJSON(), reward, guild, role };
        }),
    );

    res.json(rewards);
};

export default { controller, validation };
