import { Request, Response } from 'express';
import { param } from 'express-validator';
import { fromWei } from 'web3-utils';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import MembershipService from '@thxnetwork/api/services/MembershipService';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Memberships']
    const membership = await MembershipService.getById(req.params.id);
    if (!membership) throw new NotFoundError();

    const account = await AccountProxy.getById(req.auth.sub);
    if (!account) throw new NotFoundError('No Account');

    const pool = await PoolService.getById(membership.poolId);
    if (!pool) return res.send(membership);

    let poolBalance;
    if (pool && pool.erc20Id) {
        const balanceInWei = await pool.contract.methods.balanceOf(pool.address).call();
        poolBalance = Number(fromWei(balanceInWei));
    }

    let pendingBalance;
    if (membership.erc20Id) {
        pendingBalance = await WithdrawalService.getPendingBalance(account, pool.address);
    }

    return res.json({
        ...membership.toJSON(),
        chainId: pool.chainId,
        poolAddress: pool.address,
        poolBalance,
        pendingBalance,
    });
};

export default { controller, validation };
