import { Request, Response } from 'express';
import { body } from 'express-validator';
import { MailService } from '../../../services/MailService';

export const createLoginValidation = [
    body('email').exists(),
    body('email', 'Email is not valid').isEmail(),
    body('password').exists(),
    body('password', 'Password must be at least 16 characters long').isLength({ min: 16 }),
];

export const postLogin = async (req: Request, res: Response) => {
    await MailService.sendLoginLinkEmail(req.body.email, req.body.password);

    res.json({ message: `E-mail sent to ${req.body.email}` });
};
