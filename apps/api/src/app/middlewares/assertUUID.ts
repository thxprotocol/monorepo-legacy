import { Request } from 'express';
import { ForbiddenError } from '../util/errors';
import WalletService from '../services/WalletService';

const assertUUID = async (req: Request) => {
    const sub = await WalletService.findOne({ uuid: req.body.uuid });
    if (!sub) throw new ForbiddenError('Sub not found for this uuid.');
    req.auth = { sub };
};

export { assertUUID };
