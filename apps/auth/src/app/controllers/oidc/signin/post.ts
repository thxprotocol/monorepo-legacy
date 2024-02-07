import { Request, Response } from 'express';
import { oidc } from '../../../util/oidc';
import { body, param } from 'express-validator';
import { UnauthorizedError } from '@thxnetwork/auth/util/errors';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import AuthService from '../../../services/AuthService';
import EthereumService from '@thxnetwork/auth/services/EthereumService';

const validation = [body('email').optional().isEmail(), param('uid').isMongoId()];

async function controller(req: Request, res: Response) {
    const { email, authRequestMessage, authRequestSignature } = req.body;
    // If signed auth request is available recover the address from the signature and lookup user
    if (authRequestMessage && authRequestSignature) {
        const address = EthereumService.recoverAddress(authRequestMessage, authRequestSignature);
        if (!address) throw new UnauthorizedError('Could not recover address from signed message.');

        const account = await AccountService.findAccountForAddress(address);
        if (!account) throw new UnauthorizedError('Could not find an account for this address.');

        await oidc.interactionFinished(req, res, { login: { accountId: String(account._id) } });
    }
    // If no auth request message and signature are available use the email
    else if (email) {
        const redirectURL = `/oidc/${req.params.uid}/signin/otp`;
        await AuthService.redirectOTP(req, email);

        return res.redirect(redirectURL);
    }
}

export default { controller, validation };
