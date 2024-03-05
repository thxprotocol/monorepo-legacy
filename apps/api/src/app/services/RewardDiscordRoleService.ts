import { AccessTokenKind } from '@thxnetwork/common/enums';
import { DiscordGuild, RewardDiscordRole, RewardDiscordRolePayment } from '../models';
import { IRewardService } from './interfaces/IRewardService';
import { client } from '../../discord';
import { discordColorToHex } from '../util/discord';

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
        const guild = await this.getGuild(reward.poolId);
        const role = await this.getRole(guild.id, reward.discordRoleId);
        const discordServerURL = `https://discordapp.com/channels/${guild.id}/`;

        return {
            ...payment.toJSON(),
            discordServerURL,
            guild: {
                name: guild.name,
                icon: guild.icon && `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
            },
            role: {
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

        const guild = await this.getGuild(reward.poolId);
        if (!guild) {
            return { result: false, reason: `THX Bot is not invited to the ${guild.name} Discord server` };
        }

        const member = await this.getMember(guild.id, token.userId);
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
        const guild = await this.getGuild(reward.poolId);
        const role = await this.getRole(guild.id, reward.discordRoleId);
        const member = await this.getMember(guild.id, token.userId);

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

    private async getGuild(poolId: string) {
        const discordGuild = await DiscordGuild.findOne({ poolId });
        if (!discordGuild) return;
        return await client.guilds.fetch(discordGuild.guildId);
    }

    private async getMember(guildId: string, userId: string) {
        return await client.guilds.fetch(guildId).then((guild) => guild.members.fetch(userId));
    }

    private async getRole(guildId: string, roleId: string) {
        return await client.guilds.fetch(guildId).then((guild) => guild.roles.fetch(roleId));
    }
}
