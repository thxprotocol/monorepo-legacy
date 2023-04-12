import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import PointBalanceService, { PointBalance } from '@thxnetwork/api/services/PointBalanceService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { ERC721Token, ERC721TokenDocument } from '@thxnetwork/api/models/ERC721Token';
import { ERC721MetadataDocument } from '@thxnetwork/api/models/ERC721Metadata';
import { redeemValidation } from '@thxnetwork/api/util/perks';
import { ERC721PerkPayment } from '@thxnetwork/api/models/ERC721PerkPayment';
import MailService from '@thxnetwork/api/services/MailService';
import { Widget } from '@thxnetwork/api/models/Widget';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Perks Payment']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const widget = await Widget.findOne({ poolId: pool._id });

    const perk = await ERC721Perk.findOne({ uuid: req.params.uuid });
    if (!perk) throw new NotFoundError('Could not find this perk');
    if (!perk.pointPrice) throw new NotFoundError('No point price for this perk has been set.');

    const erc721 = await ERC721Service.findById(perk.erc721Id);
    if (!erc721) throw new NotFoundError('Could not find this erc721');

    let metadata: ERC721MetadataDocument;
    if (perk.erc721metadataId) {
        metadata = await ERC721Service.findMetadataById(perk.erc721metadataId);
        if (!metadata) {
            throw new NotFoundError('Could not find the erc721 metadata for this perk');
        }
    }

    const pointBalance = await PointBalance.findOne({ sub: req.auth.sub, poolId: pool._id });
    if (!pointBalance || Number(pointBalance.balance) < Number(perk.pointPrice))
        throw new BadRequestError('Not enough points on this account for this perk.');

    const redeemValidationResult = await redeemValidation({ perk, sub: req.auth.sub });
    if (redeemValidationResult.isError) {
        throw new ForbiddenError(redeemValidationResult.errorMessage);
    }

    const account = await AccountProxy.getById(req.auth.sub);
    const to = await account.getAddress(erc721.chainId);

    let erc721Token: ERC721TokenDocument;
    if (metadata) {
        erc721Token = await ERC721Service.mint(pool, erc721, metadata, req.auth.sub, to);
    } else {
        erc721Token = await ERC721Token.findById(perk.erc721tokenId);
        erc721Token = await ERC721Service.transferFrom(pool, erc721Token, erc721, req.auth.sub, to);
    }

    const erc721PerkPayment = await ERC721PerkPayment.create({
        perkId: perk._id,
        sub: req.auth.sub,
        poolId: pool._id,
        amount: perk.pointPrice,
    });

    await PointBalanceService.subtract(pool, req.auth.sub, perk.pointPrice);

    let html = `<p style="font-size: 18px">Congratulations!🚀</p>`;
    html += `<p>Your payment has been received and <strong>${
        metadata ? metadata.name : 'Surprise!'
    }</strong> dropped into your wallet!</p>`;
    html += `<p class="btn"><a href="${widget.domain}">View Wallet</a></p>`;

    await MailService.send(account.email, `🎁 NFT Drop! ${metadata ? metadata.name : 'Surprise!'}`, html);

    res.status(201).json({ erc721Token, erc721PerkPayment });
};

export default { controller, validation };
