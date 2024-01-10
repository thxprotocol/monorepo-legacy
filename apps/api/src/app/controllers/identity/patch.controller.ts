import { Request, Response } from 'express';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Identity } from '@thxnetwork/api/models/Identity';
import { param } from 'express-validator';
import { THXAPIClient } from '@thxnetwork/sdk/clients';
import { API_URL, AUTH_URL } from '@thxnetwork/api/config/secrets';

const validation = [param('uuid').isUUID()];

const thx = new THXAPIClient({
    apiUrl: API_URL,
    authUrl: AUTH_URL,
    clientId: 'tb4CcdHgZb5ghsNyK2uER',
    clientSecret: 'vCxjZ3ceXupVA-1ZThCVhA7jvq2Yf4TPFGYXx35SZ1e1k_JMp_fDQ4gBIhsPQc0rd6EWYK_IiNcbTVEUhFq8mA',
});

thx.identity.get('thisismysalt').then((identity) =>
    thx.events.create({
        event: 'level_up',
        identity,
    }),
);

const controller = async (req: Request, res: Response) => {
    const pool = await AssetPool.findById(req.header('X-PoolId'));
    if (!pool) throw new NotFoundError('Could not find pool.');

    const identity = await Identity.findOneAndUpdate({ uuid: req.params.uuid }, { sub: req.auth.sub }, { new: true });

    res.json(identity);
};

export default { validation, controller };
