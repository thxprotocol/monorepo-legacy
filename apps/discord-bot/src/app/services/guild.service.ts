import Guild from '../models/guilds';

export default {
    /**
     *
     * @param id Guild ID
     * @returns GuildDocument | null
     */
    get: async (id: string) => Guild.findOne({ id }),
    connect: async (id: string, poolId: string) => {
        const guildDoc = await Guild.findOneAndUpdate({ id }, { poolId }, { new: true, upsert: true });
        return guildDoc;
    },
};
