import Guild from '../models/Guild';

export default {
    /**
     *
     * @param id Guild ID
     * @returns GuildDocument | null
     */
    get: async (id: string) => {
        return await Guild.findOne({ id });
    },
    connect: async (id: string, poolId: string, channelId: string) => {
        return await Guild.findOneAndUpdate({ id }, { poolId, channelId }, { new: true, upsert: true });
    },
    disconnect: async (id: string) => {
        return await Guild.deleteOne({ id });
    },
};
