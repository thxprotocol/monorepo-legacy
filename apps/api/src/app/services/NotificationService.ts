import { QuestVariant } from '@thxnetwork/common/enums';
import { PoolDocument } from '@thxnetwork/api/models';
import { logger } from '../util/logger';
import { sleep } from '../util';
import { Notification, Widget, Participant } from '@thxnetwork/api/models';
import { DiscordButtonVariant } from '../events/InteractionCreated';
import { ButtonStyle } from 'discord.js';
import { WIDGET_URL } from '../config/secrets';
import { celebratoryWords } from '../util/dictionaries';
import AccountProxy from '../proxies/AccountProxy';
import MailService from './MailService';
import PoolService from './PoolService';
import BrandService from './BrandService';
import DiscordDataProxy from '../proxies/DiscordDataProxy';

const MAIL_CHUNK_SIZE = 600;

async function send(
    pool: PoolDocument,
    { subjectId, subject, message, link }: Partial<TNotification> & { link?: { src: string; text: string } },
) {
    const participants = await Participant.find({ poolId: pool._id, isSubscribed: true });
    const subs = participants.map((p) => p.sub);
    const accounts = (await AccountProxy.find({ subs })).filter((a) => a.email);

    // Create chunks for bulk email sending to avoid hitting Sendgrit rate limits
    for (let i = 0; i < subs.length; i += MAIL_CHUNK_SIZE) {
        const chunk = subs.slice(i, i + MAIL_CHUNK_SIZE);
        await Promise.all(
            chunk.map(async (sub) => {
                try {
                    // Make sure to not sent duplicate notifications
                    // for the same subjectId
                    const isNotifiedAlready = await Notification.exists({ sub, subjectId });
                    if (isNotifiedAlready) return;

                    const account = accounts.find((a) => a.sub === sub);
                    await MailService.send(account.email, subject, message, link);

                    await Notification.create({ sub, poolId: pool._id, subjectId, subject, message });
                } catch (error) {
                    logger.error(error);
                }
            }),
        );

        // Sleep 60 seconds before sending the next chunk
        await sleep(60);
    }
}

async function notify(variant: QuestVariant, quest: TQuest) {
    const [pool, brand, widget] = await Promise.all([
        PoolService.getById(quest.poolId),
        BrandService.get(quest.poolId),
        Widget.findOne({ poolId: quest.poolId }),
    ]);

    sendQuestPublishEmail(pool, variant, quest as TQuest, widget);
    sendQuestPublishNotification(pool, variant, quest as TQuest, widget, brand);
}

async function sendQuestPublishEmail(pool: PoolDocument, variant: QuestVariant, quest: TQuest, widget: TWidget) {
    const { amount, amounts } = quest as any;
    const subject = `🎁 New ${QuestVariant[variant]} Quest: Earn ${amount || amounts[0]} pts!"`;
    const message = `<p style="font-size: 18px">Earn ${amount || amounts[0]} points!🔔</p>
    <p>Hi! <strong>${pool.settings.title}</strong> just published a new ${QuestVariant[variant]} Quest.
    <p><strong>${quest.title}</strong><br />${quest.description}.</p>`;
    const src = WIDGET_URL + `/c/${pool.settings.slug}`;

    send(pool, {
        subjectId: quest.uuid,
        subject,
        message,
        link: { text: `Complete ${QuestVariant[variant]} Quest`, src },
    });
}

async function sendQuestPublishNotification(
    pool: PoolDocument,
    variant: QuestVariant,
    quest: TQuest,
    widget: TWidget,
    brand?: TBrand,
) {
    const theme = JSON.parse(widget.theme);
    const { amount, amounts } = quest as any;

    const embed = {
        title: quest.title,
        description: quest.description,
        author: {
            name: pool.settings.title,
            icon_url: brand ? brand.logoImgUrl : '',
            url: widget.domain,
        },
        image: { url: quest.image },
        color: parseInt(theme.elements.btnBg.color.replace(/^#/, ''), 16),
        fields: [
            {
                name: 'Points',
                value: `${amount || amounts[0]}`,
                inline: true,
            },
            {
                name: 'Type',
                value: `${QuestVariant[quest.variant]}`,
                inline: true,
            },
        ],
    };

    await DiscordDataProxy.sendChannelMessage(
        pool,
        `Hi @everyone! We published a **${QuestVariant[variant]} Quest**.`,
        [embed],
        [
            {
                customId: `${DiscordButtonVariant.QuestComplete}:${quest.variant}:${quest._id}`,
                label: 'Complete Quest!',
                style: ButtonStyle.Success,
            },
            { label: 'More Info', style: ButtonStyle.Link, url: WIDGET_URL + `/c/${pool.settings.slug}` },
        ],
    );
}

async function sendQuestEntryNotification(pool: PoolDocument, quest: TQuest, account: TAccount, amount: number) {
    const index = Math.floor(Math.random() * celebratoryWords.length);
    const discord = account.tokens && account.tokens.find((a) => a.kind === 'discord');
    const user = discord && discord.userId ? `<@${discord.userId}>` : `**${account.username}**`;
    const button = {
        customId: `${DiscordButtonVariant.QuestComplete}:${quest.variant}:${quest._id}`,
        label: 'Complete Quest',
        style: ButtonStyle.Primary,
    };
    const content = `${celebratoryWords[index]} ${user} completed the **${quest.title}** quest and earned **${amount} points.**`;

    await DiscordDataProxy.sendChannelMessage(pool, content, [], [button]);
}

export default { send, notify, sendQuestEntryNotification };
