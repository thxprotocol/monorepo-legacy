import axios from 'axios';
import { GCLOUD_PROJECT_ID, GCLOUD_RECAPTCHA_API_KEY, GCLOUD_RECAPTCHA_SITE_KEY } from '../config/secrets';
import { BadRequestError } from '../util/errors';

export default class ReCaptchaService {
    static async getRiskAnalysis({ token, recaptchaAction }) {
        const url = new URL('https://recaptchaenterprise.googleapis.com');
        url.pathname = `/v1/projects/${GCLOUD_PROJECT_ID}/assessments`;

        const { data } = await axios({
            method: 'POST',
            url: url.toString(),
            data: {
                event: {
                    token,
                    expectedAction: recaptchaAction,
                    siteKey: GCLOUD_RECAPTCHA_SITE_KEY,
                },
            },
            params: {
                key: GCLOUD_RECAPTCHA_API_KEY,
            },
        });

        // Check if the token is valid.
        if (!data.tokenProperties.valid) {
            throw new BadRequestError('Invalid ReCAPTCHA token.');
        }

        // Check if the expected action was executed.
        if (data.tokenProperties.action !== recaptchaAction) {
            throw new BadRequestError('Invalid ReCAPTCHA action.');
        }

        // Get the risk score and the reason(s).
        // https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
        return data.riskAnalysis;
    }
}
