import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { ChainId } from '@thxnetwork/common/enums';
import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { getProvider } from '@thxnetwork/api/util/network';
import { toChecksumAddress } from 'web3-utils';
import WalletService from '@thxnetwork/api/services/WalletService';
import { query } from 'express-validator';

export const validation = [query('walletId').isMongoId()];

const parseMs = (s) => Number(s) * 1000;

export const controller = async (req: Request, res: Response) => {
    const walletId = req.query.walletId as string;
    const wallet = await WalletService.findById(walletId);
    if (!wallet) throw new NotFoundError('Wallet not found.');

    const { web3 } = getProvider(ChainId.Hardhat);
    const ve = new web3.eth.Contract(
        contractArtifacts['VotingEscrow'].abi,
        contractNetworks[wallet.chainId].VotingEscrow,
    );
    const lr = new web3.eth.Contract(contractArtifacts['LensReward'].abi, contractNetworks[wallet.chainId].LensReward);

    // Check for lock and determine ve fn to call
    const { amount, end } = await ve.methods.locked(wallet.address).call();
    const latest = await web3.eth.getBlockNumber();
    const now = (await web3.eth.getBlock(latest)).timestamp;
    const callStatic = async (fn) => {
        const result = await web3.eth.call({
            to: contractNetworks[wallet.chainId].LensReward,
            data: fn.encodeABI(),
            from: toChecksumAddress(wallet.address),
        });
        return web3.eth.abi.decodeParameters(['address', 'uint256'], result);
    };
    const calls = await Promise.allSettled([
        callStatic(
            lr.methods.getUserClaimableReward(
                contractNetworks[wallet.chainId].RewardDistributor,
                toChecksumAddress(wallet.address),
                contractNetworks[wallet.chainId].BAL,
            ),
        ),
        callStatic(
            lr.methods.getUserClaimableReward(
                contractNetworks[wallet.chainId].RewardDistributor,
                toChecksumAddress(wallet.address),
                contractNetworks[wallet.chainId].BPT,
            ),
        ),
    ]);
    const rewards = calls
        .filter((result) => result.status === 'fulfilled')
        .map((call) => ({ tokenAddress: call[0], amount: call[1] }));
    const balance = await ve.methods.balanceOf(wallet.address).call();

    res.status(200).json([{ balance, amount: Number(amount), end: parseMs(end), now: parseMs(now), rewards }]);
};
export default { controller, validation };
