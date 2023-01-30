import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC20PerkPayment } from '@thxnetwork/api/models/ERC20PerkPayment';
import PointBalanceService, { PointBalance } from '@thxnetwork/api/services/PointBalanceService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Perks Payment']
    const pool = await PoolService.getById(req.header('X-PoolId'));

    const erc721Perk = await ERC721Perk.findOne({ uuid: req.params.uuid });
    if (!erc721Perk) throw new NotFoundError('Could not find this perk');

    const erc721 = await ERC721Service.findById(erc721Perk.erc721Id);
    if (!erc721) throw new NotFoundError('Could not find this erc721');

    const metadata = await ERC721Service.findMetadataById(erc721Perk.erc721metadataId);
    if (!metadata) throw new NotFoundError('Could not find the erc721 metadata for this perk');

    const pointBalance = await PointBalance.findOne({ sub: req.auth.sub, poolId: pool._id });
    if (!pointBalance || Number(pointBalance.balance) < Number(erc721Perk.pointPrice))
        throw new BadRequestError('Not enough points on this account for this perk.');

    // Get the account wallet
    const account = await AccountProxy.getById(req.auth.sub);
    const to = await account.getAddress(erc721.chainId);
    console.log(account, to);

    const erc721Token = await ERC721Service.mint(pool, erc721, metadata, req.auth.sub, to);
    const erc721PerkPayment = await ERC20PerkPayment.create({
        perkId: erc721Perk._id,
        sub: req.auth.sub,
        poolId: pool._id,
    });

    await PointBalanceService.subtract(pool, req.auth.sub, erc721Perk.pointPrice);

    res.status(201).json({ erc721Token, erc721PerkPayment });
};

export default { controller, validation };
