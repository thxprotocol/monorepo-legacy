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

const validation = [param('id').isMongoId(), body('sub').isMongoId(), body('token').isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find the pool for this token.');

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

    const erc20Ids = await ERC20Perk.find({ poolId: pool._id }).distinct('erc20Id');

    pool.sub = req.body.sub;
    await pool.save();

    for (let i = 0; i < erc20Ids.length; i++) {
        const erc20 = await ERC20.findById(erc20Ids[i]);
        await ERC20Service.findOrImport(pool, erc20.address);
    }

    await poolTransfer.deleteOne();

    const receiver = await AccountProxy.getById(req.body.sub);
    const account = await AccountProxy.getById(poolTransfer.sub);

    await MailService.send(
        account.email,
        `Pool Transferred: ${pool.settings.title}`,
        `The pool transfer has been accepted by <strong>${receiver.email}</strong>`,
    );

    res.status(200).end();
};

export default { controller, validation };
