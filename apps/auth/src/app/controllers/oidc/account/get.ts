import { Request, Response } from 'express';
import { AccountService } from '../../../services/AccountService';
import { AccountPlanType } from '@thxnetwork/types/enums';

async function controller(req: Request, res: Response) {
    const { uid, params, alert, session } = req.interaction;
    const account = await AccountService.get(session.accountId);

    return res.render('account', {
        uid,
        alert,
        params: {
            ...params,
            email: account.email,
            isEmailVerified: account.isEmailVerified,
            firstName: account.firstName,
            lastName: account.lastName,
            profileImg: account.profileImg,
            organisation: account.organisation,
            website: account.website,
            address: account.address,
            plan: account.plan,
            planType: AccountPlanType[account.plan],
            variant: account.variant,
        },
    });
}

export default { controller };
