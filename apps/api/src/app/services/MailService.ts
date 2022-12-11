import sgMail from '@sendgrid/mail';
import { SENDGRID_API_KEY } from '@thxnetwork/api/config/secrets';
import { logger } from '../util/logger';

if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
}

const send = (to: string, subject: string, html: string, link = '') => {
    if (!to) return;

    if (SENDGRID_API_KEY) {
        const options = {
            to,
            from: {
                email: 'noreply@thx.network',
                name: 'THX Network',
            },
            subject,
            html,
        };
        return sgMail.send(options);
    } else {
        logger.info({ message: 'not sending email', link });
    }
};

export default { send };
