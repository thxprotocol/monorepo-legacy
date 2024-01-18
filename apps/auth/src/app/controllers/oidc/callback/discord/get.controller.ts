import { Request, Response } from 'express';
import { AccountService } from '../../../../services/AccountService';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { callbackPostSSOCallback, callbackPreAuth } from '../../get';
import { DiscordService } from '@thxnetwork/auth/services/DiscordService';
import { AccessTokenKind } from '@thxnetwork/types/enums';

const DISCORD_GUILD_ID_THX = '836147176270856243'; // THX Network
const DISCORD_SUPPORT_CHANNEL_ID_THX = '871853680163446794'; // #support

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await callbackPreAuth(req, res);
    const { tokenInfo, email } = await DiscordService.getTokens(code);
    const isSignup = ['1', '2'].includes(interaction.params.signup_plan as string);

    // if there is a session we need to check for dups before we store the token
    if (interaction.session) {
        const isConnected = await AccountService.isConnected(interaction, tokenInfo.userId, AccessTokenKind.Discord);
        if (isConnected) {
            return res.render('error', {
                returnUrl: interaction.params.return_url,
                alert: { variant: 'danger', message: 'This account is already connected to another account.' },
            });
        }
    }
    const account = await AccountService.findOrCreate(interaction, tokenInfo, AccountVariant.SSODiscord, email);
    const returnUrl = await callbackPostSSOCallback(interaction, account);

    if (isSignup) {
        const guilds = await DiscordService.getGuilds(tokenInfo.accessToken);
        const isGuildMember = !!guilds.filter((g) => g.id === DISCORD_GUILD_ID_THX).length;

        if (!isGuildMember) {
            await DiscordService.addToGuild(tokenInfo.accessToken, tokenInfo.userId, DISCORD_GUILD_ID_THX);
            await DiscordService.sendMessage(
                tokenInfo.accessToken,
                DISCORD_SUPPORT_CHANNEL_ID_THX,
                `Hi <@${tokenInfo.userId}>! Thank you for signing up!💛\n\nWe're here to support you setting up your first Quests and Rewards!\n\nRead more in our documentation: https://docs.thx.network/ and don't hesitate to reach out to our team or fellow community members with questions.`,
            );
        }
    }

    res.redirect(returnUrl);
}

export default { controller };
