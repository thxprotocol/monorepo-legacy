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
import { ERC721PerkPayment } from '@thxnetwork/api/models/ERC721PerkPayment';
import MailService from '@thxnetwork/api/services/MailService';
import { Widget } from '@thxnetwork/api/models/Widget';
import { ERC1155Token, ERC1155TokenDocument } from '@thxnetwork/api/models/ERC1155Token';
import { ERC1155MetadataDocument } from '@thxnetwork/api/models/ERC1155Metadata';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';
import { ERC1155Document } from '@thxnetwork/api/models/ERC1155';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';
import PerkService from '@thxnetwork/api/services/PerkService';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Perks Payment']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const safe = await SafeService.findOneByPool(pool, pool.chainId);
    if (!safe) throw new NotFoundError('Could not find campaign wallet');

    const widget = await Widget.findOne({ poolId: pool._id });
    const perk = await ERC721Perk.findOne({ uuid: req.params.uuid });
    if (!perk) throw new NotFoundError('Could not find this perk');
    if (!perk.pointPrice) throw new NotFoundError('No point price for this perk has been set.');

    const nft = await PerkService.getNFT(perk);
    if (!nft) throw new NotFoundError('Could not find the nft for this perk');

    const wallet = await SafeService.findPrimary(req.auth.sub, pool.chainId);
    const pointBalance = await PointBalance.findOne({ walletId: wallet._id, poolId: pool._id });
    if (!pointBalance || Number(pointBalance.balance) < Number(perk.pointPrice))
        throw new BadRequestError('Not enough points on this account for this perk.');

    const redeemValidationResult = await PerkService.validate({ perk, sub: req.auth.sub, pool });
    if (redeemValidationResult.isError) {
        throw new ForbiddenError(redeemValidationResult.errorMessage);
    }

    const account = await AccountProxy.findById(req.auth.sub);

    let token: ERC721TokenDocument | ERC1155TokenDocument, metadata: ERC721MetadataDocument | ERC1155MetadataDocument;

    // Mint a token if metadataId is present
    if (perk.metadataId) {
        // Handle erc721 mints
        if (perk.erc721Id) {
            metadata = await PerkService.getMetadata(perk);
            token = await ERC721Service.mint(safe, nft as ERC721Document, wallet, metadata as ERC721MetadataDocument);
        }

        // Handle erc1155 mints
        if (perk.erc1155Id) {
            metadata = await PerkService.getMetadata(perk);
            token = await ERC1155Service.mint(
                safe,
                nft as ERC1155Document,
                wallet,
                metadata as ERC1155MetadataDocument,
                String(perk.erc1155Amount),
            );
        }
    }

    // Transfer a token if tokenId is present
    if (perk.tokenId) {
        // Handle erc721 transfer
        if (perk.erc721Id) {
            token = await ERC721Token.findById(perk.tokenId);
            token = await ERC721Service.transferFrom(
                nft as ERC721Document,
                safe,
                wallet.address,
                token as ERC721TokenDocument,
            );
        }

        // Handle erc1155 transfer
        if (perk.erc1155Id) {
            token = await ERC1155Token.findById(perk.tokenId);
            token = await ERC1155Service.transferFrom(
                nft as ERC1155Document,
                safe,
                wallet.address,
                String(perk.erc1155Amount),
                token as ERC1155TokenDocument,
            );
        }
        metadata = await PerkService.getMetadata(perk, token);
    }

    const erc721PerkPayment = await ERC721PerkPayment.create({
        perkId: perk._id,
        sub: req.auth.sub,
        walletId: wallet._id,
        poolId: pool._id,
        amount: perk.pointPrice,
    });

    await PointBalanceService.subtract(pool, wallet._id, perk.pointPrice);

    let html = `<p style="font-size: 18px">Congratulations!🚀</p>`;
    html += `<p>Your payment has been received and <strong>${
        metadata ? metadata.name : 'Surprise!'
    }</strong> dropped into your wallet!</p>`;
    html += `<p class="btn"><a href="${widget.domain}">View Wallet</a></p>`;

    await MailService.send(account.email, `🎁 NFT Drop! ${metadata ? metadata.name : 'Surprise!'}`, html);

    res.status(201).json({ erc721Token: token, erc721PerkPayment });
};

export default { controller, validation };
