import { track } from '@thxnetwork/auth/util/mixpanel';
import { Request, Response } from 'express';

async function controller(req: Request, res: Response) {
    const { uid, params } = req.interaction;

    track.UserVisits(params.distinct_id, `oidc forgot`, [uid, params.return_url]);

    res.render('forgot', {
        uid,
        params,
        alert: {},
    });
}

export default { controller };
