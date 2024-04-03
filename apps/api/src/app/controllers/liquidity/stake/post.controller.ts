import { contractArtifacts } from '@thxnetwork/api/services/ContractService';
import { BadRequestError } from '@thxnetwork/api/util/errors';
import { getProvider } from '@thxnetwork/api/util/network';
import { contractNetworks } from '@thxnetwork/contracts/exports';
import { BigNumber } from 'ethers';
import { Request, Response } from 'express';
import { body, query } from 'express-validator';
import LiquidityService from '@thxnetwork/api/services/LiquidityService';

export const validation = [body('amountInWei').isString(), query('walletId').isMongoId()];

export const controller = async ({ wallet, body }: Request, res: Response) => {
    const { web3 } = getProvider(wallet.chainId);
    const bpt = new web3.eth.Contract(contractArtifacts['BPT'].abi, contractNetworks[wallet.chainId].BPT);

    // Check if sender has sufficient BPT
    const balanceInWei = await bpt.methods.balanceOf(wallet.address).call();
    if (BigNumber.from(balanceInWei).lt(body.amountInWei)) {
        throw new BadRequestError('Insufficient balance');
    }

    const tx = await LiquidityService.stake(wallet, body.amountInWei);

    res.status(201).json([tx]);
};
export default { controller, validation };
