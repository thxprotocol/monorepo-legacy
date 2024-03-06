import { Request, Response } from 'express';
import { Participant } from '@thxnetwork/api/models/Participant';
import { body, param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [
    param('id').isMongoId(),
    body('isSubscribed').optional().isBoolean(),
    body('email').optional().isEmail(),
];

const controller = async (req: Request, res: Response) => {
    const participant = await Participant.findById(req.params.id);
    if (!participant) throw new NotFoundError('Participant not found.');

    // If subscribed is true and email we set the participant flag to true and patch the account
    if (req.body.isSubscribed && req.body.email) {
        const isSubscribed = JSON.parse(req.body.isSubscribed);

        if (isSubscribed) {
            await AccountProxy.update(req.auth.sub, { email: String(req.body.email) } as TAccount);
        }

        await participant.updateOne({ isSubscribed });
    }

    res.status(204).end();
};

export default { controller, validation };
