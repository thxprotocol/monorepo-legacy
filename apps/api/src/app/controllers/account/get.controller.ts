import { Request, Response } from 'express';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { ChainId } from '@thxnetwork/types/enums';
import { logger } from '@thxnetwork/api/util/logger';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';
import { Participant } from '@thxnetwork/api/models/Participant';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { Identity } from '@thxnetwork/api/models/Identity';

const validation = [];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Account']
    const account = await AccountProxy.getById(req.auth.sub);

    // Set participant rank if poolId is set
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

    const isMetamask = account.variant === AccountVariant.Metamask;
    if (!isMetamask) return res.json(account);

    const chainId = NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat;

    // If metamask search for the primary wallet of this account
    let wallet = await SafeService.findPrimary(account.sub, chainId);
    if (wallet) return res.json(account);

    // No wallet was found, create metamask wallet
    wallet = await SafeService.create({
        chainId,
        sub: account.sub,
        address: account.address,
    });

    logger.debug(`[${req.auth.sub}] Metamask Wallet: ${wallet.address}`);

    res.json(account);
};

export default { controller, validation };
