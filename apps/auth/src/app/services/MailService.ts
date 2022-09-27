import ejs from 'ejs';
import sgMail from '@sendgrid/mail';
import path from 'path';

import { AccountDocument } from '../models/Account';
import { createRandomToken } from '../util/tokens';
import { AUTH_URL, SECURE_KEY, WALLET_URL, SENDGRID_API_KEY } from '../util/secrets';
import { encryptString } from '../util/encrypt';
import { logger } from '../util/logger';

if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
}

export class MailService {
    static async sendConfirmationEmail(account: AccountDocument, returnUrl: string) {
        account.signupToken = createRandomToken();
        account.signupTokenExpires = Date.now() + 1000 * 60 * 60 * 24; // 24 hours,

        const verifyUrl = `${returnUrl}/verify?signup_token=${account.signupToken}&return_url=${returnUrl}`;
        const html = await ejs.renderFile(
            path.dirname(__dirname) + '/views/mail/signupConfirm.ejs',
            {
                verifyUrl,
                returnUrl,
                baseUrl: AUTH_URL,
            },
            { async: true },
        );

        await this.sendMail(account.email, 'Please complete the sign up for your THX Account', html, verifyUrl);

        await account.save();
    }

    static async sendLoginLinkEmail(account: AccountDocument, password: string) {
        const secureKey = encryptString(password, SECURE_KEY.split(',')[0]);
        const authToken = createRandomToken();
        const encryptedAuthToken = encryptString(authToken, password);

        const loginUrl = `${WALLET_URL}/login?authentication_token=${encryptedAuthToken}&secure_key=${secureKey}`;
        const html = await ejs.renderFile(
            path.dirname(__dirname) + '/views/mail/loginLink.ejs',
            {
                loginUrl,
                returnUrl: WALLET_URL,
                baseUrl: AUTH_URL,
            },
            { async: true },
        );

        await this.sendMail(account.email, 'A sign in is requested for your Web Wallet', html, loginUrl);

        account.authenticationToken = encryptedAuthToken;
        account.authenticationTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await account.save();
    }

    static async sendResetPasswordEmail(account: AccountDocument, returnUrl: string) {
        account.passwordResetToken = createRandomToken();
        account.passwordResetExpires = Date.now() + 1000 * 60 * 20; // 20 minutes,

        const resetUrl = `${returnUrl}/reset?passwordResetToken=${account.passwordResetToken}`;
        const html = await ejs.renderFile(
            path.dirname(__dirname) + '/views/mail/resetPassword.ejs',
            {
                resetUrl,
                returnUrl,
                baseUrl: AUTH_URL,
            },
            { async: true },
        );

        await this.sendMail(account.email, 'Reset your THX Password', html, resetUrl);

        await account.save();
    }

    static sendMail = (to: string, subject: string, html: string, link = '') => {
        if (SENDGRID_API_KEY) {
            const options = {
                to,
                from: {
                    email: 'peter@thx.network',
                    name: 'Peter Polman',
                },
                subject,
                html,
            };
            return sgMail.send(options);
        } else {
            logger.info({ message: 'not sending email', link });
        }
    };
}
