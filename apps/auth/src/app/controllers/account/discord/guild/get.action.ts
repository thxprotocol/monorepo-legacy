import { Request, Response } from 'express';
import { DiscordService } from '@thxnetwork/auth/services/DiscordService';
import { AccessTokenKind } from '@thxnetwork/auth/types/enums/AccessTokenKind';
import { IAccessToken } from '@thxnetwork/auth/types/TAccount';
import { NotFoundError } from '@thxnetwork/auth/util/errors';
import { AccountService } from '@thxnetwork/auth/services/AccountService';

export const getDiscordGuildJoined = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    const token: IAccessToken | undefined = account.getToken(AccessTokenKind.Discord);
    if (!token) {
        throw new NotFoundError();
    }

    const result = await DiscordService.validateUserJoined({
        guildId: req.params.item,
        accessToken: token.accessToken,
    });

    res.json({
        result,
    });
};
