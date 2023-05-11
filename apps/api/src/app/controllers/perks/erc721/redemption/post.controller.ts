import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ERC721Perk, ERC721PerkDocument } from '@thxnetwork/api/models/ERC721Perk';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import PointBalanceService, { PointBalance } from '@thxnetwork/api/services/PointBalanceService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { ERC721Token, ERC721TokenDocument } from '@thxnetwork/api/models/ERC721Token';
import { ERC721Metadata, ERC721MetadataDocument } from '@thxnetwork/api/models/ERC721Metadata';
import { redeemValidation } from '@thxnetwork/api/util/perks';
import { ERC721PerkPayment } from '@thxnetwork/api/models/ERC721PerkPayment';
import MailService from '@thxnetwork/api/services/MailService';
import { Widget } from '@thxnetwork/api/models/Widget';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { ERC1155Token, ERC1155TokenDocument } from '@thxnetwork/api/models/ERC1155Token';
import { ERC1155Metadata, ERC1155MetadataDocument } from '@thxnetwork/api/models/ERC1155Metadata';
import { ERC721, ERC721Document } from '@thxnetwork/api/models/ERC721';
import { ERC1155, ERC1155Document } from '@thxnetwork/api/models/ERC1155';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';

const validation = [param('uuid').exists()];

async function getNFTForPerk(perk: ERC721PerkDocument) {
    if (perk.erc721Id) {
        return await ERC721.findById(perk.erc721Id);
    }
    if (perk.erc1155Id) {
        return await ERC1155.findById(perk.erc1155Id);
    }
}

async function getMetadataForPerk(perk: ERC721PerkDocument) {
    if (perk.erc721Id && perk.metadataId) {
        return await ERC721Metadata.findById(perk.metadataId);
    }
    if (perk.erc1155Id && perk.metadataId) {
        return await ERC1155Metadata.findById(perk.metadataId);
    }
}

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Perks Payment']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const widget = await Widget.findOne({ poolId: pool._id });

    const perk = await ERC721Perk.findOne({ uuid: req.params.uuid });
    if (!perk) throw new NotFoundError('Could not find this perk');
    if (!perk.pointPrice) throw new NotFoundError('No point price for this perk has been set.');

    const nft = await getNFTForPerk(perk);
    if (!nft) throw new NotFoundError('Could not find the nft for this perk');

    const pointBalance = await PointBalance.findOne({ sub: req.auth.sub, poolId: pool._id });
    if (!pointBalance || Number(pointBalance.balance) < Number(perk.pointPrice))
        throw new BadRequestError('Not enough points on this account for this perk.');

    const redeemValidationResult = await redeemValidation({ perk, sub: req.auth.sub, pool });
    if (redeemValidationResult.isError) {
        throw new ForbiddenError(redeemValidationResult.errorMessage);
    }

    const account = await AccountProxy.getById(req.auth.sub);
    const wallet = await Wallet.findOne({ sub: req.auth.sub, chainId: pool.chainId });

    let token: ERC721TokenDocument | ERC1155TokenDocument;

    const metadata = await getMetadataForPerk(perk);

    // Mint a token if metadataId is present
    if (metadata) {
        // Handle erc721 mints
        if (perk.erc721Id) {
            token = await ERC721Service.mint(pool, nft as ERC721Document, metadata as ERC721MetadataDocument, wallet);
        }

        // Handle erc1155 mints
        if (perk.erc1155Id) {
            token = await ERC1155Service.mint(
                pool,
                nft as ERC1155Document,
                metadata as ERC1155MetadataDocument,
                perk.erc1155Amount,
                wallet,
            );
        }
    }

    // Transfer a token if tokenId is present
    if (perk.tokenId) {
        // Handle erc721 transfer
        if (perk.erc721Id) {
            token = await ERC721Token.findById(perk.tokenId);
            token = await ERC721Service.transferFrom(pool, token as ERC721TokenDocument, nft as ERC721Document, wallet);
        }

        // Handle erc1155 transfer
        if (perk.erc1155Id) {
            token = await ERC1155Token.findById(perk.tokenId);
            token = await ERC1155Service.transferFrom(
                pool,
                token as ERC1155TokenDocument,
                nft as ERC1155Document,
                wallet,
                perk.erc1155Amount,
            );
        }
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

    res.status(201).json({ erc721Token: token, erc721PerkPayment });
};

export default { controller, validation };
