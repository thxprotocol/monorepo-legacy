import Guild from '../models/guilds';

export default {
    /**
     *
     * @param id Guild ID
     * @returns GuildDocument | null
     */
    get: async (id: string) => Guild.findOne({ id }),
    connect: async (id: string, poolId: string, channelId: string) => {
        return await Guild.findOneAndUpdate({ id }, { poolId, channelId }, { new: true, upsert: true });
    },
};
