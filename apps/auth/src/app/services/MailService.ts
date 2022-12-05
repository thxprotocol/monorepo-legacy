import ejs from 'ejs';
import path from 'path';
import sgMail from '@sendgrid/mail';
import { AccountDocument } from '../models/Account';
import { createRandomToken } from '../util/tokens';
import { AUTH_URL, SECURE_KEY, WALLET_URL, SENDGRID_API_KEY } from '../config/secrets';
import { encryptString } from '../util/encrypt';
import { logger } from '../util/logger';
import { assetsPath } from '../util/path';
import { AccessTokenKind } from '../types/enums/AccessTokenKind';
import { IAccessToken } from '../types/TAccount';
import { DURATION_TWENTYFOUR_HOURS } from '../util/messages';

const mailTemplatePath = path.join(assetsPath, 'views', 'mail');

if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
}

export class MailService {
    static async sendConfirmationEmail(account: AccountDocument, returnUrl: string) {
        if (!account.email) {
            throw new Error('Account email not set.');
        }

        const token = {
            kind: AccessTokenKind.Signup,
            accessToken: createRandomToken(),
            expiry: DURATION_TWENTYFOUR_HOURS,
        } as IAccessToken;
        account.createToken(token);

        const verifyUrl = `${returnUrl}/verify?signup_token=${token.accessToken}&return_url=${returnUrl}`;
        const html = await ejs.renderFile(
            path.join(mailTemplatePath, 'signupConfirm.ejs'),
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

    static async sendVerificationEmail(account: AccountDocument, returnUrl: string) {
        if (!account.email) {
            throw new Error('Account email not set.');
        }
        const token = {
            kind: AccessTokenKind.VerifyEmail,
            accessToken: createRandomToken(),
            expiry: DURATION_TWENTYFOUR_HOURS,
        } as IAccessToken;
        account.createToken(token);

        const verifyUrl = `${returnUrl}verify_email?verifyEmailToken=${token.accessToken}&return_url=${returnUrl}`;
        const html = await ejs.renderFile(
            path.join(mailTemplatePath, 'emailConfirm.ejs'),
            {
                verifyUrl,
                returnUrl,
                baseUrl: AUTH_URL,
            },
            { async: true },
        );

        await this.sendMail(
            account.email,
            'Please complete the e-mail verification for your THX Account',
            html,
            verifyUrl,
        );

        await account.save();
    }

    static async sendLoginLinkEmail(account: AccountDocument, password: string) {
        const secureKey = encryptString(password, SECURE_KEY.split(',')[0]);
        const authToken = createRandomToken();
        const encryptedAuthToken = encryptString(authToken, password);

        const loginUrl = `${WALLET_URL}/login?authentication_token=${encryptedAuthToken}&secure_key=${secureKey}`;
        const html = await ejs.renderFile(
            path.join(mailTemplatePath, 'loginLink.ejs'),
            {
                loginUrl,
                returnUrl: WALLET_URL,
                baseUrl: AUTH_URL,
            },
            { async: true },
        );

        await this.sendMail(account.email, 'A sign in is requested for your Web Wallet', html, loginUrl);
        const token = {
            kind: AccessTokenKind.Auth,
            accessToken: encryptedAuthToken,
            expiry: Date.now() + 10 * 60 * 1000, // 10 minutes
        } as IAccessToken;

        account.createToken(token);

        await account.save();
    }

    static async sendResetPasswordEmail(account: AccountDocument, returnUrl: string) {
        const token = {
            kind: AccessTokenKind.PasswordReset,
            accessToken: createRandomToken(),
            expiry: Date.now() + 1000 * 60 * 20, // 20 minutes,
        } as IAccessToken;

        account.createToken(token);

        const resetUrl = `${returnUrl}/reset?passwordResetToken=${token.accessToken}`;
        const html = await ejs.renderFile(
            path.join(mailTemplatePath, 'resetPassword.ejs'),
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
