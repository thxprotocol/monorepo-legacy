import GithubService from '../../../../services/GithubServices';
import { Request, Response } from 'express';
import { AccountService } from '../../../../services/AccountService';
import { AccountVariant } from '../../../../types/enums/AccountVariant';
import { callbackPostSSOCallback, callbackPreAuth } from '../../get';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await callbackPreAuth(req);
    const { tokenInfo, email } = await GithubService.getTokens(code);
    const account = await AccountService.findOrCreate(interaction.session, tokenInfo, AccountVariant.SSOGithub, email);
    const returnUrl = await callbackPostSSOCallback(interaction, account);

    res.redirect(returnUrl);
}

export default { controller };
