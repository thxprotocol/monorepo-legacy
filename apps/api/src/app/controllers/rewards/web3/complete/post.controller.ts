import { Request, Response } from 'express';
import { BigNumber, ethers } from 'ethers';
import { body, param } from 'express-validator';
import { validate } from 'uuid';
import { Web3Quest } from '@thxnetwork/api/models/Web3Quest';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { recoverSigner } from '@thxnetwork/api/util/network';
import { Web3QuestClaim } from '@thxnetwork/api/models/Web3QuestClaim';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { chainList } from '@thxnetwork/common';
import SafeService from '@thxnetwork/api/services/SafeService';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';

const validation = [
    param('uuid').custom((uuid) => validate(uuid)),
    body('signature').isString(),
    body('chainId').isInt(),
];

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    const pool = await AssetPool.findById(poolId);
    if (!pool) throw new NotFoundError('Could not find campaign');

    const quest = await Web3Quest.findOne({ uuid: req.params.uuid });
    if (!quest) throw new NotFoundError('Could not find Web3 Quest');

    const wallet = await SafeService.findPrimary(req.auth.sub, pool.chainId);
    if (!wallet) throw new NotFoundError('Could not find primary wallet');

    const rpc = chainList[req.body.chainId].chain.rpcUrls.default;
    if (!rpc) throw new NotFoundError('Could not find RPC');

    const provider = new ethers.providers.JsonRpcProvider(rpc.http[0]);
    const address = recoverSigner(req.body.message, req.body.signature);
    const isClaimed = await Web3QuestClaim.exists({
        web3QuestId: quest._id,
        $or: [{ sub: req.auth.sub }, { walletId: wallet._id }, { address }],
    });
    if (isClaimed) {
        return res.json({ error: 'You have claimed this reward already' });
    }

    const contract = quest.contracts.find((c) => c.chainId === req.body.chainId);
    const contractInstance = new ethers.Contract(
        contract.address,
        ['function ' + quest.methodName + '(address) view returns (uint256)'],
        provider,
    );

    let result: BigNumber;
    try {
        result = await contractInstance[quest.methodName](address);
    } catch (error) {
        return res.json({ error: 'Smart contract call failed' });
    }

    const threshold = BigNumber.from(quest.threshold);
    if (result.lt(threshold)) {
        return res.json({ error: 'Result does not meet the threshold' });
    }

    const claim = await Web3QuestClaim.create({
        web3QuestId: quest._id,
        poolId,
        chainId: req.body.chainId,
        address,
        sub: req.auth.sub,
        walletId: wallet._id,
        amount: quest.amount,
    });

    await PointBalanceService.add(pool, wallet._id, quest.amount);

    res.json(claim);
};

export default { controller, validation };
