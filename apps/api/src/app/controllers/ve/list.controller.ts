import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { ChainId } from '@thxnetwork/common/lib/types/enums';
import { contractArtifacts } from '@thxnetwork/contracts/exports';
import { getProvider } from '@thxnetwork/api/util/network';
import SafeService from '@thxnetwork/api/services/SafeService';
import { BAL_ADDRESS, BPT_ADDRESS, LR_ADDRESS, RD_ADDRESS, VE_ADDRESS } from '@thxnetwork/api/config/secrets';
import { toChecksumAddress } from 'web3-utils';

export const validation = [];

const parseMs = (s) => Number(s) * 1000;

export const controller = async (req: Request, res: Response) => {
    const wallet = await SafeService.findPrimary(req.auth.sub, ChainId.Hardhat);
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const { web3 } = getProvider(ChainId.Hardhat);
    const ve = new web3.eth.Contract(contractArtifacts['VotingEscrow'].abi, VE_ADDRESS);
    const lr = new web3.eth.Contract(contractArtifacts['LensReward'].abi, LR_ADDRESS);

    // Check for lock and determine ve fn to call
    const { amount, end } = await ve.methods.locked(wallet.address).call();
    const latest = await web3.eth.getBlockNumber();
    const now = (await web3.eth.getBlock(latest)).timestamp;
    const callStatic = async (fn) => {
        const result = await web3.eth.call({
            to: LR_ADDRESS,
            data: fn.encodeABI(),
            from: toChecksumAddress(wallet.address),
        });
        return web3.eth.abi.decodeParameters(['address', 'uint256'], result);
    };
    const calls = await Promise.all([
        callStatic(lr.methods.getUserClaimableReward(RD_ADDRESS, toChecksumAddress(wallet.address), BAL_ADDRESS)),
        callStatic(lr.methods.getUserClaimableReward(RD_ADDRESS, toChecksumAddress(wallet.address), BPT_ADDRESS)),
    ]);
    const rewards = calls.map((call) => ({ tokenAddress: call[0], amount: call[1] }));
    const veTHX = await ve.methods.balanceOf(wallet.address).call();
    console.log({ rewards });

    res.status(200).json([{ veTHX, amount: Number(amount), end: parseMs(end), now: parseMs(now), rewards }]);
};
export default { controller, validation };
