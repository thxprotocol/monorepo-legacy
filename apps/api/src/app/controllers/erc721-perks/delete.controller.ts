import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import ERC721PerkService from '@thxnetwork/api/services/ERC721PerkService';
import MerchantService from '@thxnetwork/api/services/MerchantService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    const perk = await ERC721PerkService.get(req.params.id);
    if (!perk) throw new NotFoundError('Could not find the reward');

    await MerchantService.removePaymentLink(perk.paymentLinkId);
    await ERC721PerkService.remove(perk);

    return res.status(204).end();
};

export default { controller, validation };
