import { Response, Request, NextFunction } from 'express';
import { contractNetworks } from '@thxnetwork/contracts/exports';
import { BigNumber } from 'ethers';
import { getContract } from '../services/ContractService';
import { logger } from '../util/logger';
import SafeService from '../services/SafeService';
import PoolService from '../services/PoolService';

/*
 * This middleware function is used to assert payments of the pool owner.
 * @dev Assumes that the poolId is available as 'id' param in the request
 */
export async function assertPayment(req: Request, res: Response, next: NextFunction) {
    const pool = await PoolService.getById(req.params.id);
    const safe = await SafeService.findOneByPool(pool);
    const contract = getContract('THXPaymentSplitter', safe.chainId, contractNetworks[safe.chainId].THXPaymentSplitter);
    const balanceInWei = await contract.balanceOf(safe.address);

    // If pool.createdAt + 2 weeks is larger than now there should be a payment
    const isPostTrial = Date.now() > new Date(pool.trialEndsAt).getTime();
    if (isPostTrial && BigNumber.from(balanceInWei).eq(0)) {
        // @dev Disable until we agree on a better notification flow
        // throw new ForbiddenError('Payment is required.');
        logger.info(JSON.stringify({ poolId: pool._id, safeAddress: safe.address, isPostTrial, balanceInWei }));
    }

    next();
}
