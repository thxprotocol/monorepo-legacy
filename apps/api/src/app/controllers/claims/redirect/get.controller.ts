import { Request, Response } from 'express';
import { param } from 'express-validator';
import { RewardNFT, QRCodeEntry } from '@thxnetwork/api/models';
import { validate } from 'uuid';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('uuid').custom((uuid) => validate(uuid))];

const controller = async (req: Request, res: Response) => {
    const entry = await QRCodeEntry.findOne({ uuid: req.params.uuid });
    if (!entry) throw new NotFoundError('Could not find QR code');

    const erc721Perk = await RewardNFT.findOne({ uuid: entry.rewardUuid });
    if (!erc721Perk) throw new NotFoundError('Could not find QR code collection.');

    const url = new URL(erc721Perk.redirectUrl);

    url.searchParams.append('thx_widget_path', `/c/${req.params.uuid}`);

    res.redirect(302, url.toString());
};

export default { controller, validation };
