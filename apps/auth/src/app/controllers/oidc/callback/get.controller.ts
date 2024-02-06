import { Request, Response } from 'express';
import { AccessTokenKind } from '@thxnetwork/common/lib/types';
import { providerAccountVariantMap } from '@thxnetwork/common/lib/types/maps/oauth';
import AuthService from '@thxnetwork/auth/services/AuthService';
import TokenService from '@thxnetwork/auth/services/TokenService';

export async function controller(req: Request, res: Response) {
    const { code, interaction } = await AuthService.redirectCallback(req);
    const kind = req.params.kind as AccessTokenKind;
    const token = await TokenService.request({ kind, code });
    const variant = providerAccountVariantMap[kind];
    const account = await AuthService.connect(interaction, token, variant);
    const returnUrl = await AuthService.getReturn(interaction, account);

    res.redirect(returnUrl);
}

export default { controller };
