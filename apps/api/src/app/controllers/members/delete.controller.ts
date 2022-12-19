import { Request, Response } from 'express';
import { param } from 'express-validator';
import MemberService from '@thxnetwork/api/services/MemberService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import MembershipService from '@thxnetwork/api/services/MembershipService';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('address').isEthereumAddress()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Members']
    const isMember = await MemberService.isMember(req.assetPool, req.params.address);
    if (!isMember) throw new NotFoundError();

    await MemberService.removeMember(req.assetPool, req.params.address);

    const account = await AccountProxy.getByAddress(req.params.address);
    await MembershipService.removeMembership(account.sub, req.assetPool);

    res.status(204).end();
};

export default { controller, validation };
