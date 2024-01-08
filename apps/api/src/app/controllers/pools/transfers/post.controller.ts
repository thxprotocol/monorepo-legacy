import PoolService from '@thxnetwork/api/services/PoolService';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { PoolTransfer } from '@thxnetwork/api/models/PoolTransfer';
import ERC20 from '@thxnetwork/api/models/ERC20';
import { ERC20Perk } from '@thxnetwork/api/models/ERC20Perk';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import MailService from '@thxnetwork/api/services/MailService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [param('id').isMongoId(), body('sub').isMongoId(), body('token').isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find the pool for this token.');

    const safe = await SafeService.findOneByPool(pool, pool.chainId);
    if (!safe) throw new NotFoundError('Could not find the Safe for this pool.');

    const poolTransfer = await PoolTransfer.findOne({ sub: pool.sub, token: req.body.token });
    if (!poolTransfer) throw new NotFoundError('Could not find this pool transfer token.');

    if (pool.sub === req.body.sub) {
        throw new ForbiddenError("You can't transfer this pool to yourself.");
    }

    if (new Date(poolTransfer.expiry).getTime() < Date.now()) {
        throw new ForbiddenError('This pool transfer URL has expired.');
    }

    if (poolTransfer.poolId !== String(pool._id)) {
        throw new ForbiddenError('This pool transfer token is not generated for this pool.');
    }

    // Send email to old account
    const account = await AccountProxy.getById(pool.sub);
    if (account.email) {
        await MailService.send(
            account.email,
            'Campaign Transfer: Completed',
            `Campaign "${pool.settings.title}" has been transfered to ${account.email}.`,
        );
    }

    pool.sub = req.body.sub;

    await safe.updateOne({ sub: req.body.sub });
    await pool.save();

    const erc20Ids = await ERC20Perk.find({ poolId: pool._id }).distinct('erc20Id');
    for (let i = 0; i < erc20Ids.length; i++) {
        const erc20 = await ERC20.findById(erc20Ids[i]);
        await ERC20Service.findOrImport(pool, erc20.address);
    }

    await poolTransfer.deleteOne();

    res.status(200).end();
};

export default { controller, validation };
