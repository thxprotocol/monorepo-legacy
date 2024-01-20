import { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { ChainId } from '@thxnetwork/common/lib/types/enums';
import { getProvider } from '@thxnetwork/api/util/network';
import SafeService from '@thxnetwork/api/services/SafeService';
import { BigNumber } from 'ethers';
import LiquidityService from '@thxnetwork/api/services/LiquidityService';

export const validation = [body('usdcAmountInWei').isBoolean(), body('thxAmountInWei').isBoolean()];

export const controller = async (req: Request, res: Response) => {
    const wallet = await SafeService.findPrimary(req.auth.sub, ChainId.Hardhat);
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const { web3 } = getProvider(ChainId.Hardhat);

    // Check sufficient USDC approval
    const usdcAmount = BigNumber.from(req.body.usdcAmountInWei);
    const thxAmount = BigNumber.from(req.body.thxAmountInWei);
    // const usdc = await LiquidityService.joinPool()

    res.status(201).json();
};
export default { controller, validation };
