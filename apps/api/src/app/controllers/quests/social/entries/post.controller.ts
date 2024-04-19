import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { JobType, agenda } from '@thxnetwork/api/util/agenda';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { QuestVariant } from '@thxnetwork/sdk/types/enums';
import { TwitterUser } from '@thxnetwork/api/models/TwitterUser';
import { DiscordMessage, DiscordReaction, QuestSocial } from '@thxnetwork/api/models';
import QuestService from '@thxnetwork/api/services/QuestService';
import DiscordService from '@thxnetwork/api/services/DiscordService';
import { QuestSocialRequirement } from '@thxnetwork/common/enums';

const validation = [param('id').isMongoId(), body('recaptcha').isString()];

const controller = async ({ params, body, account }: Request, res: Response) => {
    // Get the quest document
    const quest = await QuestSocial.findById(params.id);
    if (!quest) throw new NotFoundError('Quest not found');

    // Get platform user id for account
    const platformUserId = QuestService.findUserIdForInteraction(account, quest.interaction);
    if (!platformUserId) return res.json({ error: 'Could not find platform user id.' });

    const data = { metadata: { platformUserId, discord: {}, twitter: {} }, recaptcha: body.recaptcha };

    // Running separately to avoid issues when getting validation results from Discord interactions
    const isRealUser = await QuestService.isRealUser(quest.variant, { quest, account, data });
    if (!isRealUser.result) return res.json({ error: isRealUser.reason });

    // Get validation result for this quest entry
    const { result, reason } = await QuestService.getValidationResult(quest.variant, { quest, account, data });
    if (!result) return res.json({ error: reason });

    // For Discord Bot quests we store server user name in metadata
    if (quest.variant === QuestVariant.Discord && quest.interaction !== QuestSocialRequirement.DiscordGuildJoined) {
        const guild = await DiscordService.getGuild(quest.poolId);
        const member = guild && (await DiscordService.getMember(guild.id, platformUserId));

        data.metadata.discord = {
            guildId: guild && guild.id,
            username: member.user.username,
            joinedAt: new Date(member.joinedTimestamp).toISOString(),
            reactionCount: guild
                ? await DiscordReaction.countDocuments({ guildId: guild.id, userId: platformUserId })
                : 0,
            messageCount: guild
                ? await DiscordMessage.countDocuments({ guildId: guild.id, userId: platformUserId })
                : 0,
        };
    }

    // For Twitter quests we store public metrics in metadata
    if (quest.variant === QuestVariant.Twitter) {
        const user = await TwitterUser.findOne({ userId: platformUserId });
        data.metadata.twitter = user.publicMetrics;
    }

    // Schedule serial job
    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant: quest.variant,
        questId: String(quest._id),
        sub: account.sub,
        data,
    });

    res.json({ jobId: job.attrs._id });
};

export default { controller, validation };
