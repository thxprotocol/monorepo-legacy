import { Request, Response } from 'express';
import { AccountService } from '../../../services/AccountService';
import airtable from '../../../util/airtable';
import { DASHBOARD_URL } from '../../../config/secrets';
import { track } from '@thxnetwork/auth/util/mixpanel';

async function controller(req: Request, res: Response) {
    const { uid, params } = req.interaction;
    const { error, result, account } = await AccountService.verifySignupToken(params.signup_token);
    const shouldAddUser = (params.return_url || '').includes(DASHBOARD_URL);

    track.UserVisits(params.distinct_id, `oidc sign up confirm`, [uid, params.return_url]);

    if (result && shouldAddUser) {
        await airtable.pipelineSignup({
            Email: account.email,
            Date: account.createdAt,
            AcceptUpdates: account.acceptUpdates,
        });
    }

    return res.render('confirm', {
        uid,
        params,
        alert: {
            variant: error ? 'danger' : 'success',
            message: error || result,
        },
    });
}

export default { controller };
