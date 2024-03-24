import { ButtonInteraction, CommandInteraction, User } from 'discord.js';
import { WIDGET_URL } from '@thxnetwork/api/config/secrets';
import { handleError } from '../error';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import { PoolDocument, Participant, DiscordGuild, Pool } from '@thxnetwork/api/models';

export enum DiscordCommandVariant {
    GivePoints = 0,
    RemovePoints = 1,
}

async function removePoints(
    pool: PoolDocument,
    sender: TAccount,
    receiver: TAccount,
    senderUser: User,
    receiverUser: User,
    amount: number,
) {
    await PointBalanceService.subtract(pool, receiver, amount);

    const participant = await Participant.findOne({
        poolId: pool._id,
        sub: receiver.sub,
    });

    const senderMessage = `The balance of <@${receiverUser.id}> has been decreased with **${amount} points** and is now **${participant.balance}**.`;
    const receiverMessage = `<@${senderUser.id}> decreased your balance with **${amount}** resulting in a total of **${participant.balance} points**.`;

    return { senderMessage, receiverMessage };
}

async function addPoints(
    pool: PoolDocument,
    sender: TAccount,
    receiver: TAccount,
    senderUser: User,
    receiverUser: User,
    amount: number,
) {
    await PointBalanceService.add(pool, receiver, amount);

    const participant = await Participant.findOne({
        poolId: pool._id,
        sub: receiver.sub,
    });
    const senderMessage = `The balance of <@${receiverUser.id}> has been increased with **${amount} points** and is now **${participant.balance}**!`;
    const receiverMessage = `<@${senderUser.id}> increased your balance with **${amount}** resulting in a total of **${participant.balance} points**.`;

    return { senderMessage, receiverMessage };
}

const pointsFunctionMap = {
    [DiscordCommandVariant.GivePoints]: addPoints,
    [DiscordCommandVariant.RemovePoints]: removePoints,
};

export async function getDiscordGuild(interaction: CommandInteraction | ButtonInteraction) {
    const discordGuilds = await DiscordGuild.find({ guildId: interaction.guild.id });
    if (!discordGuilds.length) return { error: 'No campaign found ' };
    if (discordGuilds.length === 1) return { discordGuild: discordGuilds[0] };

    const choice = ((interaction as CommandInteraction).options as any).getString('campaign');
    if (!choice) return { error: 'Please, select a campaign for this command.' };

    const campaign = await Pool.findOne({ 'settings.title': choice });
    if (!campaign) return { error: 'Could not find campaing for this choice.' };

    const discordGuild = discordGuilds.find((g) => g.poolId === String(campaign._id));
    return { discordGuild };
}

export const onSubcommandPoints = async (interaction: CommandInteraction, variant: DiscordCommandVariant) => {
    try {
        const account = await AccountProxy.getByDiscordId(interaction.user.id);
        if (!account) throw new Error('Please, connect your THX Account with Discord first.');

        const user = interaction.options.getUser('user');
        if (!user) throw new Error('Please, provide a valid username.');

        const { discordGuild, error } = await getDiscordGuild(interaction);
        if (error) throw new Error(error);

        // Check optional secret
        const secret = interaction.options.get('secret');
        if (discordGuild.secret && discordGuild.secret.length) {
            if (!secret) throw new Error('Please, provide a secret.');
            if (discordGuild.secret !== secret.value) throw new Error('Please, provide a valid secret.');
        }

        // Check role
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.roles.cache.has(discordGuild.adminRoleId)) {
            const role = await interaction.guild.roles.fetch(discordGuild.adminRoleId);
            throw new Error(`Only **${role.name}** roles have access to this command!`);
        }

        const amount = interaction.options.get('amount');
        if (!amount.value || Number(amount.value) < 1) throw new Error('Please, provide a valid amount.');

        const pool = await Pool.findById(discordGuild.poolId);
        if (!pool) throw new Error('Could not find connected campaign.');

        const receiver = await AccountProxy.getByDiscordId(user.id);
        if (!receiver) {
            user.send({
                content: `<@${interaction.user.id}> failed to send you ${amount.value} points. Please [sign in](${WIDGET_URL}/c/${pool._id}), connect Discord and notify the sender!`,
            });
            throw new Error('Please, ask the receiver to connect a Discord account.');
        }

        // Determine if we should add or remove using pointsFunctionMap
        const { senderMessage, receiverMessage } = await pointsFunctionMap[variant](
            pool,
            account,
            receiver,
            interaction.user,
            user,
            Number(amount.value),
        );

        // Send reaction to caller
        interaction.reply({
            content: senderMessage,
            ephemeral: true,
        });

        // Send DM to user
        user.send({ content: receiverMessage });
    } catch (error) {
        handleError(error, interaction);
    }
};
export default { onSubcommandPoints };
