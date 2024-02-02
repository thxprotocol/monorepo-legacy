import { Request, Response } from 'express';
import { formatAccountRes } from './get.controller';
import { AccountService } from '../../services/AccountService';
import { body } from 'express-validator';

const validation = [
    body('subs')
        .custom((subs) => {
            return Array.isArray(JSON.parse(subs));
        })
        .customSanitizer((subs) => subs && JSON.parse(subs)),
];

const controller = async (req: Request, res: Response) => {
    const accounts = await AccountService.find({ _id: req.body.subs });
    const result = await Promise.all(accounts.map(async (account) => await formatAccountRes(account)));

    res.send(result);
};

export default { validation, controller };
