import { Request, Response } from 'express';
import AuthService from '@thxnetwork/auth/services/AuthService';

async function controller(req: Request, res: Response) {
    const { uid, params } = req.interaction;
    const { error, result } = await AuthService.verifyEmailToken(params.verifyEmailToken);

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
