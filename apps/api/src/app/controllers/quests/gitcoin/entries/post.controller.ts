import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { validate } from 'uuid';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { recoverSigner } from '@thxnetwork/api/util/network';
import { Web3QuestClaim } from '@thxnetwork/api/models/Web3QuestClaim';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { JobType, QuestVariant } from '@thxnetwork/common/lib/types';
import { GitcoinQuest } from '@thxnetwork/api/models/GitcoinQuest';
import SafeService from '@thxnetwork/api/services/SafeService';
import QuestService from '@thxnetwork/api/services/QuestService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import GitcoinService from '@thxnetwork/api/services/GitcoinService';
import LockService from '@thxnetwork/api/services/LockService';
import { agenda } from '@thxnetwork/api/util/agenda';

const validation = [
    param('uuid').custom((uuid) => validate(uuid)),
    body('signature').isString(),
    body('chainId').isInt(),
];

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    const pool = await AssetPool.findById(poolId);
    if (!pool) throw new NotFoundError('Could not find campaign');

    const quest = await GitcoinQuest.findOne({ uuid: req.params.uuid });
    if (!quest) throw new NotFoundError('Could not find Web3 Quest');

    const wallet = await SafeService.findPrimary(req.auth.sub, pool.chainId);
    if (!wallet) throw new NotFoundError('Could not find primary wallet');

    const isLocked = await LockService.getIsLocked(quest.locks, wallet);
    if (isLocked) throw new ForbiddenError('Quest is locked!');

    // START validation
    const address = recoverSigner(req.body.message, req.body.signature);
    // TODO Maybe store address as wallet in case of future reward usage?
    const isClaimed = await Web3QuestClaim.exists({
        questId: quest._id,
        $or: [{ sub: req.auth.sub }, { walletId: wallet._id }, { address }],
    });
    if (isClaimed) {
        return res.json({ error: 'You have claimed this quest already.' });
    }

    const { score, error } = await GitcoinService.getScoreUniqueHumanity(quest.scorerId, address.toLowerCase());
    if (error) return res.json({ error });
    if (score < quest.score)
        return res.json({ error: `Your score ${score || 0}/100 does not meet the minimum of ${quest.score}/100.` });
    // END;

    const account = await AccountProxy.findById(req.auth.sub);
    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant: QuestVariant.Gitcoin,
        questId: quest._id,
        sub: account.sub,
        data: {
            address,
        },
    });

    res.json({ jobId: job.attrs._id });
};

export default { controller, validation };
