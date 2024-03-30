import { AccessTokenKind } from '@thxnetwork/common/enums';
import { RewardDiscordRole, RewardDiscordRolePayment } from '../models';
import { IRewardService } from './interfaces/IRewardService';
import { discordColorToHex } from '../util/discord';
import DiscordService from './DiscordService';

export default class RewardDiscordRoleService implements IRewardService {
    models = {
        reward: RewardDiscordRole,
        payment: RewardDiscordRolePayment,
    };

    async decorate({ reward, account }) {
        const token = account && account.tokens.find(({ kind }) => kind === AccessTokenKind.Discord);
        return { ...reward.toJSON(), isDisabled: !token };
    }

    async decoratePayment(payment: TRewardPayment): Promise<TRewardDiscordRolePayment> {
        const reward = await this.models.reward.findById(payment.rewardId);
        const guild = reward && (await DiscordService.getGuild(reward.poolId));
        const role = guild && reward && (await DiscordService.getRole(guild.id, reward.discordRoleId));
        const discordServerURL = guild && `https://discordapp.com/channels/${guild.id}/`;

        return {
            ...payment.toJSON(),
            discordServerURL,
            guild: guild && {
                name: guild.name,
                icon: guild.icon && `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
            },
            role: role && {
                name: role.name,
                color: discordColorToHex(role.color),
            },
        };
    }

    async getValidationResult({ reward, account }: { reward: TReward; account?: TAccount }) {
        const token = this.getToken(account);
        if (!token) {
            return { result: false, reason: 'Your account is not connected to a Discord account' };
        }

        const guild = await DiscordService.getGuild(reward.poolId);
        if (!guild) {
            return { result: false, reason: `THX Bot is not invited to the ${guild.name} Discord server` };
        }

        const member = await DiscordService.getMember(guild.id, token.userId);
        if (!member) {
            return { result: false, reason: `You are not a member of the ${guild.name} Discord server` };
        }

        return { result: true, reason: '' };
    }

    create(data: Partial<TReward>) {
        return this.models.reward.create(data);
    }

    update(reward: TReward, updates: Partial<TReward>): Promise<TReward> {
        return this.models.reward.findByIdAndUpdate(reward, updates, { new: true });
    }

    remove(reward: TReward): Promise<void> {
        return this.models.reward.findByIdAndDelete(reward._id);
    }

    findById(id: string) {
        return this.models.reward.findById(id);
    }

    async createPayment({ reward, account }: { reward: TRewardNFT; account: TAccount }) {
        const token = this.getToken(account);
        const guild = await DiscordService.getGuild(reward.poolId);
        const role = await DiscordService.getRole(guild.id, reward.discordRoleId);
        const member = await DiscordService.getMember(guild.id, token.userId);

        // Add role to discord user
        await member.roles.add(role);

        // Register the payment
        await this.models.payment.create({
            rewardId: reward._id,
            discordRoleId: reward.discordRoleId,
            sub: account.sub,
            poolId: reward.poolId,
            amount: reward.pointPrice,
        });
    }

    private getToken(account: TAccount) {
        return account.tokens.find(({ kind }) => kind === AccessTokenKind.Discord);
    }
}
