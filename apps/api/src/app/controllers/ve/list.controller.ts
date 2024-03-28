import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { getProvider } from '@thxnetwork/api/util/network';
import { query } from 'express-validator';
import WalletService from '@thxnetwork/api/services/WalletService';
import VoteEscrowService from '@thxnetwork/api/services/VoteEscrowService';

export const validation = [query('walletId').isMongoId()];

const parseMs = (s) => Number(s) * 1000;

export const controller = async (req: Request, res: Response) => {
    const walletId = req.query.walletId as string;
    const wallet = await WalletService.findById(walletId);
    if (!wallet) throw new NotFoundError('Wallet not found.');

    const { web3 } = getProvider(wallet.chainId);
    const ve = new web3.eth.Contract(
        contractArtifacts['VotingEscrow'].abi,
        contractNetworks[wallet.chainId].VotingEscrow,
    );

    // Check for lock and determine ve fn to call
    // Get veTHX balance and pending rewards
    const [{ amount, end }, latestBlock, balance, rewards] = await Promise.all([
        VoteEscrowService.list(wallet),
        web3.eth.getBlock('latest'),
        ve.methods.balanceOf(wallet.address).call(),
        VoteEscrowService.listRewards(wallet),
    ]);

    res.json([{ balance, amount, end: parseMs(end), now: parseMs(latestBlock.timestamp), rewards }]);
};

export default { controller, validation };
