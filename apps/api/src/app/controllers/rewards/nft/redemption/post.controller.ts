import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { RewardNFT } from '@thxnetwork/api/models/RewardNFT';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { ERC721Token, ERC721TokenDocument } from '@thxnetwork/api/models/ERC721Token';
import { ERC721MetadataDocument } from '@thxnetwork/api/models/ERC721Metadata';
import { RewardNFTPayment } from '@thxnetwork/api/models/RewardNFTPayment';
import MailService from '@thxnetwork/api/services/MailService';
import { ERC1155Token, ERC1155TokenDocument } from '@thxnetwork/api/models/ERC1155Token';
import { ERC1155MetadataDocument } from '@thxnetwork/api/models/ERC1155Metadata';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';
import { ERC1155Document } from '@thxnetwork/api/models/ERC1155';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';
import RewardService from '@thxnetwork/api/services/RewardService';
import SafeService from '@thxnetwork/api/services/SafeService';
import { Participant } from '@thxnetwork/api/models/Participant';

const validation = [param('id').isMongoId(), body('walletId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Perks Payment']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const safe = await SafeService.findOneByPool(pool, pool.chainId);
    if (!safe) throw new NotFoundError('Could not find campaign wallet');

    const reward = await RewardNFT.findById(req.params.id);
    if (!reward) throw new NotFoundError('Could not find this perk');
    if (!reward.pointPrice) throw new NotFoundError('No point price for this perk has been set.');

    const nft = await RewardService.getNFT(reward);
    if (!nft) throw new NotFoundError('Could not find the nft for this perk');

    const account = await AccountProxy.findById(req.auth.sub);
    const participant = await Participant.findOne({ sub: account.sub, poolId: pool._id });
    if (!participant || Number(participant.balance) < Number(reward.pointPrice))
        throw new BadRequestError('Not enough points on this account for this perk.');

    const redeemValidationResult = await RewardService.validate({ reward, account, pool });
    if (redeemValidationResult.isError) {
        throw new ForbiddenError(redeemValidationResult.errorMessage);
    }

    const wallet = await SafeService.findById(req.body.walletId);
    if (!wallet) throw new BadRequestError('No wallet found for this reward payment request.');

    let token: ERC721TokenDocument | ERC1155TokenDocument, metadata: ERC721MetadataDocument | ERC1155MetadataDocument;

    // Mint a token if metadataId is present
    if (reward.metadataId) {
        // Handle erc721 mints
        if (reward.erc721Id) {
            metadata = await RewardService.getMetadata(reward);
            token = await ERC721Service.mint(safe, nft as ERC721Document, wallet, metadata as ERC721MetadataDocument);
        }

        // Handle erc1155 mints
        if (reward.erc1155Id) {
            metadata = await RewardService.getMetadata(reward);
            token = await ERC1155Service.mint(
                safe,
                nft as ERC1155Document,
                wallet,
                metadata as ERC1155MetadataDocument,
                String(reward.erc1155Amount),
            );
        }
    }

    // Transfer a token if tokenId is present
    if (reward.tokenId) {
        // Handle erc721 transfer
        if (reward.erc721Id) {
            token = await ERC721Token.findById(reward.tokenId);
            token = await ERC721Service.transferFrom(
                nft as ERC721Document,
                safe,
                wallet.address,
                token as ERC721TokenDocument,
            );
        }

        // Handle erc1155 transfer
        if (reward.erc1155Id) {
            token = await ERC1155Token.findById(reward.tokenId);
            token = await ERC1155Service.transferFrom(
                nft as ERC1155Document,
                safe,
                wallet.address,
                String(reward.erc1155Amount),
                token as ERC1155TokenDocument,
            );
        }
        metadata = await RewardService.getMetadata(reward, token);
    }

    const erc721PerkPayment = await RewardNFTPayment.create({
        rewardId: reward._id,
        sub: req.auth.sub,
        walletId: wallet._id,
        poolId: pool._id,
        amount: reward.pointPrice,
    });

    await PointBalanceService.subtract(pool, account, reward.pointPrice);

    let html = `<p style="font-size: 18px">Congratulations!🚀</p>`;
    html += `<p>Your payment has been received and <strong>${
        metadata ? metadata.name : 'Surprise!'
    }</strong> dropped into your wallet!</p>`;
    html += `<p class="btn"><a href="${pool.campaignURL}">View Wallet</a></p>`;

    await MailService.send(account.email, `🎁 NFT Drop! ${metadata ? metadata.name : 'Surprise!'}`, html);

    res.status(201).json({ erc721Token: token, erc721PerkPayment });
};

export default { controller, validation };
