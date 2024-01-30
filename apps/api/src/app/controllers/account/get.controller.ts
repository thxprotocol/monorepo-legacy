import { Request, Response } from 'express';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { logger } from '@thxnetwork/api/util/logger';
import { Participant } from '@thxnetwork/api/models/Participant';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { Identity } from '@thxnetwork/api/models/Identity';
import { getChainId } from '@thxnetwork/api/services/ContractService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const account = await AccountProxy.findById(req.auth.sub);
    account.tokens = account.tokens.map(({ kind, userId }) => ({ kind, userId })) as any;

    // Set participant rank if poolId is provided
    const poolId = req.header('X-PoolId');
    if (poolId) {
        const participant = await Participant.findOne({ poolId, sub: req.auth.sub });
        account['rank'] = participant && participant.rank;
    }

    // @peterpolman This is FK specific and should deprecate asap
    // We search for a created virtual wallet and update the identity with the sub
    // This should fix quest entry calculations
    const virtualWallet = await Wallet.findOne({ poolId, address: account.address });
    if (virtualWallet) await Identity.findOneAndUpdate({ uuid: virtualWallet.uuid }, { sub: account.sub });
    // @peterpolman .

    // Special case for MM authenticated accounts
    if (account.variant === AccountVariant.Metamask) {
        // If metamask search for the primary wallet of this account
        let wallet = await SafeService.findPrimary(account.sub);

        // No wallet was found, create metamask wallet
        if (!wallet) {
            wallet = await SafeService.create({
                chainId: getChainId(),
                sub: account.sub,
                address: account.address,
            });

            logger.debug(`[${req.auth.sub}] Metamask Wallet: ${wallet.address}`);
        }
    }

    res.json(account);
};

export default { controller, validation };
