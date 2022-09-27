import MemberService from '@thxnetwork/api/services/MemberService';
import MembershipService from '@thxnetwork/api/services/MembershipService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { Request, Response } from 'express';
import { AlreadyAMemberError, NoUserFound } from '@thxnetwork/api/util/errors';
import { body } from 'express-validator';

const validation = [body('address').isEthereumAddress()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Members']
    const account = await AccountProxy.getByAddress(req.body.address);
    if (!account) throw new NoUserFound();
    const isMember = await MemberService.isMember(req.assetPool, account.address);
    if (isMember) throw new AlreadyAMemberError(account.address, req.assetPool.address);

    await MemberService.addMember(req.assetPool, req.body.address);

    if (req.assetPool.erc20Id) {
        await MembershipService.addERC20Membership(account.id, req.assetPool);
    }

    if (req.assetPool.erc721Id) {
        await MembershipService.addERC721Membership(account.id, req.assetPool);
    }

    res.status(200).send();
};

export default { controller, validation };
