import GithubService from '../../../../services/GithubServices';
import AuthService from '@thxnetwork/auth/services/AuthService';
import { Request, Response } from 'express';
import { AccountVariant } from '@thxnetwork/types/interfaces';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await AuthService.redirectCallback(req);
    const tokens = await GithubService.getTokens(code);
    const account = await AuthService.signin(interaction, tokens, AccountVariant.SSOGithub);
    const returnUrl = await AuthService.getReturn(interaction, account);

    res.redirect(returnUrl);
}

export default { controller };
