import { Request, Response } from 'express';
import { body } from 'express-validator';
import { Token } from '@thxnetwork/auth/models/Token';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { AccessTokenKind } from '@thxnetwork/common/enums';

const validation = [
    body('subs')
        .optional()
        .custom((subs) => {
            return Array.isArray(JSON.parse(subs));
        })
        .customSanitizer((subs) => subs && JSON.parse(subs)),
    body('query').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    let accounts = [];
    const { subs, query } = req.body;
    if (subs && subs.length) {
        accounts = await AccountService.find({ _id: req.body.subs });
    }
    if (query) {
        accounts = await AccountService.findByQuery({ query: req.body.query });
    }

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
                tokens: tokens.map(({ kind, sub, userId, metadata }) => ({ kind, sub, userId, metadata })),
            };
        }),
    );

    res.send(result);
};

export default { validation, controller };
