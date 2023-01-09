import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import { InsufficientBalanceError, NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC20PerkPayment } from '@thxnetwork/api/models/ERC20PerkPayment';
import { IAccount } from '@thxnetwork/api/models/Account';
import PointBalanceService, { PointBalance } from '@thxnetwork/api/services/PointBalanceService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import WalletService from '@thxnetwork/api/services/WalletService';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Perks Payment']
    const pool = await PoolService.getById(req.header('X-PoolId'));

    const erc721Perk = await ERC721Perk.findOne({ uuid: req.params.uuid });
    if (!erc721Perk) throw new NotFoundError('Could not find this perk');

    const erc721 = await ERC721Service.findByPool(pool);
    if (!erc721) throw new NotFoundError('Could not find this perk');

    const metadata = await ERC721Service.findMetadataById(erc721Perk.erc721metadataId);
    if (!metadata) throw new NotFoundError('Could not find the erc721 metadata for this perk');

    const { balance } = await PointBalance.findOne({ sub: req.auth.sub, poolId: pool._id });
    if (Number(balance) < Number(erc721Perk.pointPrice))
        throw new InsufficientBalanceError('Not enough points on this account for this perk.');

    // Get the account wallet
    const wallet = await WalletService.findOneByQuery({ sub: req.auth.sub, chainId: pool.chainId });
    if (!wallet) throw new NotFoundError('Could not find walle tfor this account.');

    const account = { sub: req.auth.sub, address: wallet.address } as IAccount;
    const erc721Token = await ERC721Service.mint(pool, erc721, metadata, account);
    const erc721PerkPayment = await ERC20PerkPayment.create({ perkId: erc721Perk._id, sub: req.auth.sub });

    await PointBalanceService.subtract(pool, req.auth.sub, erc721Perk.pointPrice);

    res.status(201).json({ erc721Token, erc721PerkPayment });
};

export default { controller, validation };
