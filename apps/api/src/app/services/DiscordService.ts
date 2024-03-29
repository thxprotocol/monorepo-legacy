import { client } from '../../discord';
import { DiscordGuild } from '../models';

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
}
