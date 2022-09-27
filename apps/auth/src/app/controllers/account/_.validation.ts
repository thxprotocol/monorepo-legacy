import { isAddress } from 'web3-utils';
import { body } from 'express-validator';

function checkIsAddress(value: string) {
    return isAddress(value);
}

export const validations = {
    postAccount: [
        body('email').exists().isEmail(),
        body('password').exists().isString().isLength({ min: 6 }),
        body('address').optional().custom(checkIsAddress),
    ],
};
