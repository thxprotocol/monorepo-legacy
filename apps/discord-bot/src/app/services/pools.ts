import Guild from '../models/guilds';

export default {
    connect: async (guildId: string, poolId: string) => {
        const guildDoc = await Guild.findOneAndUpdate({ guildId }, { poolId }, { new: true });
        return guildDoc;
    },
};
