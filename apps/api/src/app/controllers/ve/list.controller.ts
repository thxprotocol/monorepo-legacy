import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { ChainId } from '@thxnetwork/common/enums';
import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { getProvider } from '@thxnetwork/api/util/network';
import { toChecksumAddress } from 'web3-utils';
import { getChainId } from '@thxnetwork/api/services/ContractService';
import SafeService from '@thxnetwork/api/services/SafeService';

export const validation = [];

const parseMs = (s) => Number(s) * 1000;

export const controller = async (req: Request, res: Response) => {
    const chainId = getChainId();
    const wallet = await SafeService.findOne({ sub: req.auth.sub, chainId });
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const { web3 } = getProvider(ChainId.Hardhat);
    const ve = new web3.eth.Contract(contractArtifacts['VotingEscrow'].abi, contractNetworks[chainId].VotingEscrow);
    const lr = new web3.eth.Contract(contractArtifacts['LensReward'].abi, contractNetworks[chainId].LensRewar);

    // Check for lock and determine ve fn to call
    const { amount, end } = await ve.methods.locked(wallet.address).call();
    const latest = await web3.eth.getBlockNumber();
    const now = (await web3.eth.getBlock(latest)).timestamp;
    const callStatic = async (fn) => {
        const result = await web3.eth.call({
            to: contractNetworks[chainId].LensReward,
            data: fn.encodeABI(),
            from: toChecksumAddress(wallet.address),
        });
        return web3.eth.abi.decodeParameters(['address', 'uint256'], result);
    };
    const calls = await Promise.all([
        callStatic(
            lr.methods.getUserClaimableReward(
                contractNetworks[chainId].RewardDistributor,
                toChecksumAddress(wallet.address),
                contractNetworks[chainId].BAL,
            ),
        ),
        callStatic(
            lr.methods.getUserClaimableReward(
                contractNetworks[chainId].RewardDistributor,
                toChecksumAddress(wallet.address),
                contractNetworks[chainId].BPT,
            ),
        ),
    ]);
    const rewards = calls.map((call) => ({ tokenAddress: call[0], amount: call[1] }));
    const veTHX = await ve.methods.balanceOf(wallet.address).call();
    console.log({ rewards });

    res.status(200).json([{ veTHX, amount: Number(amount), end: parseMs(end), now: parseMs(now), rewards }]);
};
export default { controller, validation };
