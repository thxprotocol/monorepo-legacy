import { thxClient } from '../configs/oidc';
import Guild from '../models/guilds';

export default {
    /**
     *
     * @param id Guild ID
     * @returns GuildDocument | null
     */
    get: async (id: string) => {
        const guild = await Guild.findOne({ id });
        thxClient.session.update({ poolId: guild.poolId });
        return guild;
    },
    connect: async (id: string, poolId: string, channelId: string) => {
        return await Guild.findOneAndUpdate({ id }, { poolId, channelId }, { new: true, upsert: true });
    },
    disconnect: async (id: string) => {
        return await Guild.deleteOne({ id });
    },
};
