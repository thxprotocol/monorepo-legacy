import sgMail from '@sendgrid/mail';
import { AUTH_URL, NODE_ENV, SENDGRID_API_KEY, CYPRESS_EMAIL } from '@thxnetwork/api/config/secrets';
import { logger } from '../util/logger';
import path from 'path';
import { assetsPath } from '../util/path';
import ejs from 'ejs';

if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
}

const mailTemplatePath = path.join(assetsPath, 'views', 'email');

const send = async (to: string, subject: string, htmlContent: string, link = { src: '', text: '' }) => {
    if (!to) return;

    const html = await ejs.renderFile(
        path.join(mailTemplatePath, 'base-template.ejs'),
        { link, subject, htmlContent, baseUrl: AUTH_URL },
        { async: true },
    );

    if (!SENDGRID_API_KEY || NODE_ENV === 'test' || CYPRESS_EMAIL === to) {
        logger.info({ message: 'not sending email', link });
        return;
    }

    try {
        return sgMail.send({
            to,
            from: { email: 'noreply@thx.network', name: 'THX Network' },
            subject,
            html,
        });
    } catch (error) {
        console.error(error);
    }
};

export default { send };
