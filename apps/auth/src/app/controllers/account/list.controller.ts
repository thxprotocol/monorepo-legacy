import { Request, Response } from 'express';
import { AccountService } from '../../services/AccountService';
import { body } from 'express-validator';
import { Token } from '@thxnetwork/auth/models/Token';
import { AccessTokenKind } from '@thxnetwork/common/lib/types/enums';

const validation = [
    body('subs')
        .custom((subs) => {
            return Array.isArray(JSON.parse(subs));
        })
        .customSanitizer((subs) => subs && JSON.parse(subs)),
];

const controller = async (req: Request, res: Response) => {
    const accounts = await AccountService.find({ _id: req.body.subs });
    const result = await Promise.all(
        accounts.map(async (account) => {
            const sub = String(account._id);
            const kinds = [
                AccessTokenKind.Google,
                AccessTokenKind.Twitter,
                AccessTokenKind.Discord,
                AccessTokenKind.Twitch,
                AccessTokenKind.Github,
            ];
            const tokens = await Token.find({ sub, kind: { $in: kinds } });
            const profileImg = account.profileImg || `https://api.dicebear.com/7.x/identicon/svg?seed=${sub}`;

            return {
                sub,
                profileImg,
                username: account.username,
                address: account.address,
                firstName: account.firstName,
                lastName: account.lastName,
                website: account.website,
                organisation: account.organisation,
                plan: account.plan,
                email: account.email,
                variant: account.variant,
                role: account.role,
                goal: account.goal,
                tokens,
            };
        }),
    );

    res.send(result);
};

export default { validation, controller };
