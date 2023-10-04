import { QuestVariant, RewardConditionInteraction } from '@thxnetwork/types/enums';
import { TPointReward, TQuest } from '@thxnetwork/types/interfaces';
import { DailyReward } from './DailyRewardService';
import { ReferralReward } from '../models/ReferralReward';
import { PointReward } from './PointRewardService';
import { Web3Quest } from '../models/Web3Quest';
import { MilestoneReward } from '../models/MilestoneReward';
import { v4 } from 'uuid';
import { Widget } from '../models/Widget';
import DiscordDataProxy, { NotificationVariant, notificationVariantMap } from '../proxies/DiscordDataProxy';
import PoolService from './PoolService';
import BrandService from './BrandService';
import NotificationService from './NotificationService';

const questInteractionNotificationVariantMap = {
    [RewardConditionInteraction.TwitterFollow]: NotificationVariant.QuestTwitter,
    [RewardConditionInteraction.TwitterLike]: NotificationVariant.QuestTwitter,
    [RewardConditionInteraction.TwitterMessage]: NotificationVariant.QuestTwitter,
    [RewardConditionInteraction.TwitterRetweet]: NotificationVariant.QuestTwitter,
    [RewardConditionInteraction.YouTubeLike]: NotificationVariant.QuestYouTube,
    [RewardConditionInteraction.YouTubeSubscribe]: NotificationVariant.QuestYouTube,
    [RewardConditionInteraction.DiscordGuildJoined]: NotificationVariant.QuestDiscord,
};

const getModel = (variant: QuestVariant) => {
    const questModelMap = {
        [QuestVariant.Daily]: DailyReward,
        [QuestVariant.Invite]: ReferralReward,
        [QuestVariant.Social]: PointReward,
        [QuestVariant.Custom]: MilestoneReward,
        [QuestVariant.Web3]: Web3Quest,
    };

    return questModelMap[variant] as any;
};

function getNotificationVariant(questVariant, interaction?: RewardConditionInteraction) {
    switch (questVariant) {
        case QuestVariant.Daily:
            return NotificationVariant.QuestDaily;
        case QuestVariant.Invite:
            return NotificationVariant.QuestDaily;
        case QuestVariant.Social:
            return questInteractionNotificationVariantMap[interaction];
        case QuestVariant.Custom:
            return NotificationVariant.QuestCustom;
        case QuestVariant.Web3:
            return NotificationVariant.QuestWeb3;
    }
}

async function notify(variant: NotificationVariant, quest: Partial<TQuest>) {
    // @dev Quests that dont have an interaction might not get a notificationVariant
    if (typeof variant === 'undefined') return;

    const pool = await PoolService.getById(quest.poolId);
    const brand = await BrandService.get(quest.poolId);
    const widget = await Widget.findOne({ poolId: pool._id });
    const { amount, amounts } = quest as any;

    const { content, questVariant, actionLabel } = notificationVariantMap[variant];
    const subject = `🎁 ${questVariant}: Earn ${amount || amounts[0]} pts!"`;
    const message = `<p style="font-size: 18px">New ${questVariant}!🔔</p>
    <p>Hi! <strong>${pool.settings.title}</strong> ${content}.
    <p><strong>${quest.title}</strong><br />${quest.description}.</p>`;

    await NotificationService.send(pool, {
        subjectId: quest.uuid,
        subject,
        message,
        link: { text: actionLabel, src: widget.domain },
    });

    await DiscordDataProxy.sendChannelMessage(
        variant,
        { ...pool.settings, ...widget.toJSON(), logoImgUrl: brand && brand.logoImgUrl },
        {
            image: quest.image,
            title: `Earn ${amount || amounts[0]} pts!`,
            description: `**${quest.title}**\n${quest.description}`,
        },
    );
}

async function update(questVariant: QuestVariant, questId: string, data: Partial<TQuest>) {
    const model = getModel(questVariant);
    const quest = await model.findById(questId);

    if (data.isPublished && Boolean(data.isPublished) !== quest.isPublished) {
        const { interaction } = data as TPointReward;
        const notificationVariant = getNotificationVariant(questVariant, interaction);

        notify(notificationVariant, { ...quest.toJSON(), ...data, image: data.image || quest.image });
    }

    return await model.findByIdAndUpdate(questId, data, { new: true });
}

async function create(questVariant: QuestVariant, poolId: string, data: Partial<TQuest>) {
    const model = getModel(questVariant);
    const quest = await model.create({ ...data, poolId, uuid: v4() });

    if (data.isPublished) {
        const { interaction } = data as TPointReward;
        const notificationVariant = getNotificationVariant(questVariant, interaction);

        notify(notificationVariant, quest);
    }

    return quest;
}

export default { getModel, create, update };
