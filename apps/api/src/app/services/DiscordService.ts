import { client } from '../../discord';
import { DiscordGuild, DiscordMessage, DiscordReaction } from '../models';
import { DiscordUser } from '../models/DiscordUser';

export default class DiscordService {
    static async getGuild(poolId: string) {
        const discordGuild = await DiscordGuild.findOne({ poolId });
        if (!discordGuild) return;
        return await client.guilds.fetch(discordGuild.guildId);
    }

    static async getMember(guildId: string, userId: string) {
        return await client.guilds.fetch(guildId).then((guild) => guild.members.fetch(userId));
    }

    static async getRole(guildId: string, roleId: string) {
        return await client.guilds.fetch(guildId).then((guild) => guild.roles.fetch(roleId));
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
