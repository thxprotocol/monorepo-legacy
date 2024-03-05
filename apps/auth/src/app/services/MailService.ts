import ejs from 'ejs';
import path from 'path';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AccountDocument } from '../models/Account';
import { createRandomToken } from '../util/tokens';
import { assetsPath } from '../util/path';
import { AccessTokenKind } from '@thxnetwork/common/enums/AccessTokenKind';
import { get24HoursExpiryTimestamp } from '../util/time';
import {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AUTH_URL,
    WALLET_URL,
    NODE_ENV,
    CYPRESS_EMAIL,
} from '../config/secrets';
import { sendMail } from '@thxnetwork/common/mail';
import { logger } from '../util/logger';
import TokenService from './TokenService';

const mailTemplatePath = path.join(assetsPath, 'views', 'mail');

function createOTP(account: AccountDocument) {
    return account.email === CYPRESS_EMAIL
        ? '00000'
        : Array.from({ length: 5 })
              .map(() => crypto.randomInt(0, 10))
              .join('');
}

export class MailService {
    static sendMail(to: string, subject: string, html: string, link = '') {
        if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || NODE_ENV === 'test' || CYPRESS_EMAIL === to) {
            logger.debug({ message: 'Not sending e-mail', link });
            return;
        }
        sendMail(to, subject, html);
    }

    static async sendVerificationEmail(account: AccountDocument, email: string, returnUrl: string) {
        const accessToken = createRandomToken();
        const expiry = get24HoursExpiryTimestamp();
        const token = await TokenService.setToken(account, {
            kind: AccessTokenKind.VerifyEmail,
            accessToken,
            expiry,
        });
        const verifyURL = new URL(returnUrl);
        verifyURL.pathname = '/verify_email';
        verifyURL.searchParams.append('verifyEmailToken', token.accessTokenEncrypted);
        verifyURL.searchParams.append('return_url', returnUrl);

        const html = await ejs.renderFile(
            path.join(mailTemplatePath, '/email-verify.ejs'),
            { verifyURL: verifyURL.toString(), returnUrl, baseUrl: AUTH_URL },
            { async: true },
        );

        this.sendMail(
            email,
            'Please complete the e-mail verification for your THX Account',
            html,
            verifyURL.toString(),
        );
    }

    static async sendOTPMail(account: AccountDocument) {
        const otp = createOTP(account);
        const hashedOtp = await bcrypt.hash(otp, 10);
        const html = await ejs.renderFile(
            path.join(mailTemplatePath, 'email-otp.ejs'),
            { otp, returnUrl: WALLET_URL, baseUrl: AUTH_URL },
            { async: true },
        );

        this.sendMail(account.email, 'Request: Sign in', html);

        await TokenService.setToken(account, {
            kind: AccessTokenKind.Auth,
            accessToken: hashedOtp,
            expiry: Date.now() + 60 * 60 * 1000, // 60 minutes
        });
    }
}
