import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';
import { WithdrawalState, WithdrawalType } from '@thxnetwork/api/types/enums';
import { WithdrawalDocument } from '@thxnetwork/api/models/Withdrawal';
import { findRewardByUuid, isTERC20Perk, isTERC721Perk } from '@thxnetwork/api/util/rewards';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import { validateCondition } from '@thxnetwork/api/util/condition';
import { ERC20PerkPayment } from '@thxnetwork/api/models/ERC20PerkPayment';
import { ERC721PerkPayment } from '@thxnetwork/api/models/ERC721PerkPayment';

const validation = [param('id').exists().isString(), query('forceSync').optional().isBoolean()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Claims']

    const claim = await ClaimService.findByUuid(req.params.id);
    if (!claim) throw new BadRequestError('This claim URL is invalid.');

    const pool = await PoolService.getById(claim.poolId);
    if (!pool) throw new BadRequestError('The pool for this perks has been removed.');

    const account = await AccountProxy.getById(req.auth.sub);
    if (!account.address) throw new BadRequestError('The authenticated account has not accessed its wallet.');

    const perk = await findRewardByUuid(claim.rewardUuid);
    if (!perk) throw new BadRequestError('The perk for this ID does not exist.');

    // Force sync by default but allow the requester to do async calls.
    const forceSync = req.query.forceSync !== undefined ? req.query.forceSync === 'true' : true;

    if (isTERC20Perk(perk) && claim.erc20Id) {
        // Validate the claim
        const { result, error } = await validateCondition(account, perk);
        if (!result || error) return res.json({ error });

        if (await ERC20PerkPayment.exists({ perkId: perk._id, sub: req.auth.sub })) {
            return res.json({ error });
        }

        let withdrawal: WithdrawalDocument = await WithdrawalService.create(
            pool,
            WithdrawalType.ClaimReward,
            req.auth.sub,
            Number(perk.amount),
            WithdrawalState.Pending,
            null,
            String(perk._id),
        );
        const erc20 = await ERC20Service.getById(perk.erc20Id);
        withdrawal = await WithdrawalService.withdrawFor(pool, withdrawal, account, erc20, forceSync);

        const claim = await ERC20PerkPayment.create({
            sub: req.auth.sub,
            perkId: perk._id,
        });

        return res.json({ withdrawal, erc20, reward: perk, claim });
    }

    if (isTERC721Perk(perk) && claim.erc721Id) {
        // Validate the claim
        const { result, error } = await validateCondition(account, perk);
        if (!result || error) return res.json({ error });

        if (await ERC721PerkPayment.exists({ perkId: perk._id, sub: req.auth.sub })) {
            return res.json({ error });
        }

        const metadata = await ERC721Service.findMetadataById(perk.erc721metadataId);
        if (!metadata) throw new NotFoundError('No metatdata found for reward');
        const erc721 = await ERC721Service.findById(metadata.erc721);
        const token = await ERC721Service.mint(pool, erc721, metadata, account, forceSync);

        const claim = await ERC721PerkPayment.create({
            sub: req.auth.sub,
            perkId: perk._id,
        });

        return res.json({ token, erc721, metadata, reward: perk, claim });
    }
};

export default { controller, validation };
