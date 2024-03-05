import { Message } from 'discord.js';
import { logger } from '../util/logger';
import { DiscordMessage, DiscordGuild, QuestSocial, QuestSocialDocument } from '@thxnetwork/api/models';
import { QuestSocialRequirement } from '@thxnetwork/common/enums';
import AccountProxy from '../proxies/AccountProxy';

const onMessageCreate = async (message: Message) => {
    try {
        // Only record messages for connected accounts
        const connectedAccount = await AccountProxy.getByDiscordId(message.author.id);
        if (!connectedAccount) return;

        logger.info(`#${message.author.id} created message ${message.id} in guild ${message.guild.id}`);

        const start = new Date();
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setUTCHours(23, 59, 59, 999);

        const guild = await DiscordGuild.findOne({ guildId: message.guild.id });
        const quests = await QuestSocial.find({
            poolId: guild.poolId,
            interaction: QuestSocialRequirement.DiscordMessage,
        });
        if (!quests.length) return;

        // Return early if channel is not eligble for message tracking
        const allowedChannels = quests.reduce((list: string[], q: QuestSocialDocument) => {
            const { channels } = JSON.parse(q.contentMetadata);
            return [...list, ...channels];
        }, []);
        if (!allowedChannels.includes(message.channelId)) return;

        // Count the total amount of messages for today
        const dailyMessageCount = await DiscordMessage.countDocuments({
            guildId: message.guild.id,
            memberId: message.author.id,
            createdAt: { $gte: start, $lt: end },
        });

        // Get the highest limit for all available discord message quests in this campaign
        const dailyMessageLimit = quests.reduce((highestLimit: number, quest: QuestSocialDocument) => {
            const { limit } = JSON.parse(quest.contentMetadata);
            return limit > highestLimit ? limit : highestLimit;
        }, 0);

        // Only track messages if daily limit has not been surpassed
        if (dailyMessageCount > dailyMessageLimit) return;

        // Store the message
        const payload = { messageId: message.id, guildId: message.guild.id, memberId: message.author.id };
        await DiscordMessage.findOneAndUpdate(payload, payload, { upsert: true });
    } catch (error) {
        logger.error(error);
    }
};

export default onMessageCreate;
