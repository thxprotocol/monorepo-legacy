import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { getChainId, getContract } from '@thxnetwork/api/config/contracts';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [];

export const controller = async (req: Request, res: Response) => {
    const chainId = getChainId();
    const safe = await SafeService.findPrimary(req.auth.sub, chainId);
    if (!safe) throw new NotFoundError('Could not find Safe for user');

    const bpt = getContract('BPT', chainId);
    const balanceInWei = await bpt.balanceOf(safe.address);

    res.status(200).json(String(balanceInWei));
};
export default { controller, validation };
