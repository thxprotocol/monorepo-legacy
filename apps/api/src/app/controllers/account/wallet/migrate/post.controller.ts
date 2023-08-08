import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { ChainId } from '@thxnetwork/types/enums';
import SafeService, { Wallet } from '@thxnetwork/api/services/SafeService';
import { body } from 'express-validator';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';

export const validation = [body('erc20Id').optional().isMongoId(), body('erc721TokenId').optional().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const chainId = NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat;
    const safeWallet = await SafeService.findPrimary(req.auth.sub, chainId);
    if (!safeWallet) throw new NotFoundError('Safe wallet not found.');

    // Find existing THX Smart Wallet so we can migrate assets
    const thxWallet = await Wallet.findOne({
        sub: req.auth.sub,
        chainId,
        version: '4.0.12',
        address: { $exists: true, $ne: '' },
        safeVersion: { $exists: false },
    });
    if (!thxWallet) throw new NotFoundError('THX wallet not found.');

    const { erc20Id, erc721TokenId } = req.body;
    if (erc20Id) {
        await ERC20Service.migrate(thxWallet, safeWallet, erc20Id);
    }
    if (erc721TokenId) {
        await ERC721Service.migrate(thxWallet, safeWallet, erc721TokenId);
    }

    res.json(safeWallet);
};

export default { controller, validation };
