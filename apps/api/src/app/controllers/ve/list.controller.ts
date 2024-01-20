import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { ChainId } from '@thxnetwork/common/lib/types/enums';
import { contractArtifacts } from '@thxnetwork/contracts/exports';
import { getProvider } from '@thxnetwork/api/util/network';
import SafeService from '@thxnetwork/api/services/SafeService';
import { VE_ADDRESS } from '@thxnetwork/api/config/secrets';

export const validation = [];

export const controller = async (req: Request, res: Response) => {
    const wallet = await SafeService.findPrimary(req.auth.sub, ChainId.Hardhat);
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const { web3 } = getProvider(ChainId.Hardhat);
    const ve = new web3.eth.Contract(contractArtifacts['VotingEscrow'].abi, VE_ADDRESS);

    // Check for lock and determine ve fn to call
    const { amount, end } = await ve.methods.locked(wallet.address).call();
    const latest = await web3.eth.getBlockNumber();
    const now = (await web3.eth.getBlock(latest)).timestamp;

    res.status(200).json([{ amount, end, now }]);
};
export default { controller, validation };
