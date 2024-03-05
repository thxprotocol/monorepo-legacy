import {
    AUTH_URL,
    NODE_ENV,
    CYPRESS_EMAIL,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
} from '@thxnetwork/api/config/secrets';
import path from 'path';
import { assetsPath } from '../util/path';
import ejs from 'ejs';
import { sendMail } from '@thxnetwork/common/mail';
import { logger } from '../util/logger';

const mailTemplatePath = path.join(assetsPath, 'views', 'email');

const send = async (to: string, subject: string, htmlContent: string, link = { src: '', text: '' }) => {
    if (!to) return;

    const html = await ejs.renderFile(
        path.join(mailTemplatePath, 'base-template.ejs'),
        { link, subject, htmlContent, baseUrl: AUTH_URL },
        { async: true },
    );

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || NODE_ENV === 'test' || CYPRESS_EMAIL === to) {
        logger.debug({ message: 'Not sending e-mail', link });
        return;
    }

    return sendMail(to, subject, html);
};

export default { send };
