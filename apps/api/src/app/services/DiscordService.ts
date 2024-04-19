import { client } from '../../discord';
import { DiscordGuild, DiscordMessage, DiscordReaction } from '../models';
import { DiscordUser } from '../models/DiscordUser';
import { logger } from '../util/logger';

export default class DiscordService {
    static async getGuild(poolId: string) {
        const discordGuild = await DiscordGuild.findOne({ poolId });
        if (!discordGuild) return;
        try {
            // Might fail if bot is removed from the guild
            return await client.guilds.fetch(discordGuild.guildId);
        } catch (error) {
            logger.error(error);
        }
    }

    static async getMember(guildId: string, userId: string) {
        try {
            // Might fail if bot is removed from the guild
            return await client.guilds.fetch(guildId).then((guild) => guild.members.fetch(userId));
        } catch (error) {
            logger.error(error);
        }
    }

    static async getRole(guildId: string, roleId: string) {
        try {
            return await client.guilds.fetch(guildId).then((guild) => guild.roles.fetch(roleId));
        } catch (error) {
            logger.error(error);
        }
    }

    static async getUserMetrics(poolId: string, userId: string) {
        const guild = await this.getGuild(poolId);
        if (!guild) return;

        const member = await this.getMember(guild.id, userId);
        if (!member) return;

        const profileImgUrl = member.user.displayAvatarURL({ forceStatic: true });
        const query = { guildId: guild.id, userId };

        return await DiscordUser.create({
            userId,
            guildId: guild.id,
            profileImgUrl,
            username: member.user.username,
            publicMetrics: {
                joinedAt: new Date(member.joinedTimestamp).toISOString(),
                reactionCount: guild ? await DiscordReaction.countDocuments(query) : 0,
                messageCount: guild ? await DiscordMessage.countDocuments(query) : 0,
            },
        });
    }
}
