import { Request, Response } from 'express';
import { DiscordService } from '@thxnetwork/auth/services/DiscordService';
import { AccountService } from '@thxnetwork/auth/services/AccountService';

export const getDiscordGuildJoined = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    const result = await DiscordService.validateUserJoined(account, req.params.item);
    res.json(result);
};
