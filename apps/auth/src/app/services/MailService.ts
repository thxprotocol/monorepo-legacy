import ejs from 'ejs';
import path from 'path';
import sgMail from '@sendgrid/mail';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AccountDocument } from '../models/Account';
import { createRandomToken } from '../util/tokens';
import { AUTH_URL, WALLET_URL, SENDGRID_API_KEY, NODE_ENV } from '../config/secrets';
import { assetsPath } from '../util/path';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { IAccessToken } from '../types/TAccount';
import { get24HoursExpiryTimestamp } from '../util/time';
import { logger } from '../util/logger';

const mailTemplatePath = path.join(assetsPath, 'views', 'mail');

if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
}

export class MailService {
    static sendMail = (to: string, subject: string, html: string, link = '') => {
        if (SENDGRID_API_KEY && NODE_ENV !== 'test') {
            return sgMail.send({
                to,
                from: { email: 'noreply@thx.network', name: 'THX Network' },
                subject,
                html,
            });
        } else {
            logger.info({ message: 'not sending email', html, link });
        }
    };

    static async sendVerificationEmail(account: AccountDocument, returnUrl: string) {
        if (!account.email) {
            throw new Error('Account email not set.');
        }
        const token = {
            kind: AccessTokenKind.VerifyEmail,
            accessToken: createRandomToken(),
            expiry: get24HoursExpiryTimestamp(),
        } as IAccessToken;
        account.setToken(token);

        const verifyUrl = `${returnUrl}verify_email?verifyEmailToken=${token.accessToken}&return_url=${returnUrl}`;
        const html = await ejs.renderFile(
            path.join(mailTemplatePath, 'email-verify.ejs'),
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

    static async sendOTPMail(account: AccountDocument) {
        const otp = Array.from({ length: 5 })
            .map(() => crypto.randomInt(0, 10))
            .join('');
        const hashedOtp = await bcrypt.hash(otp, 10);
        const html = await ejs.renderFile(
            path.join(mailTemplatePath, 'email-otp.ejs'),
            { otp, returnUrl: WALLET_URL, baseUrl: AUTH_URL },
            { async: true },
        );

        await this.sendMail(account.email, 'Request: Sign in', html);

        account.setToken({
            kind: AccessTokenKind.Auth,
            accessToken: hashedOtp,
            expiry: Date.now() + 60 * 60 * 1000, // 60 minutes
        });

        await account.save();
    }
}
