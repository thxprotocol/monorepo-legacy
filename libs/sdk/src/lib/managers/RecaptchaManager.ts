import { THXClient } from '../clients';
import BaseManager from './BaseManager';

const GCLOUD_RECAPTCHA_SITE_KEY = '6LdRy6QpAAAAAFQDHZu2Z9XnuwutsgywgCALABNJ';

class RecaptchaManager extends BaseManager {
    isLoaded = false;

    constructor(client: THXClient) {
        super(client);
        this.loadScript();
    }

    private loadScript() {
        // Create the ReCaptcha script tag for the environments site key and append it to the head
        console.log('Loading reCAPTCHA script');
        const script = document.createElement('script');
        script.onload = this.onLoad.bind(this);
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${GCLOUD_RECAPTCHA_SITE_KEY}`;
        document.body.appendChild(script);
    }

    private async waitForScript() {
        // Wait for script to load
        await new Promise((resolve) => {
            const interval = setInterval(() => {
                if (this.isLoaded) {
                    clearInterval(interval);
                    resolve(null);
                }
            }, 100);
        });
    }

    private async waitForBadge() {
        // wait for badge element to appear
        await new Promise((resolve) => {
            const interval = setInterval(() => {
                const badges = document.getElementsByClassName('grecaptcha-badge');
                if (badges && badges.length) {
                    clearInterval(interval);
                    resolve(null);
                }
            }, 100);
        });
    }

    async getToken(action: string) {
        if (typeof window === 'undefined') {
            throw new Error('Window object not available! Use this method in a browser environment.');
        }

        if (!this.isLoaded) {
            await this.waitForScript();
        }

        const { grecaptcha } = window as unknown as { grecaptcha: any };
        if (!grecaptcha) {
            throw new Error('reCAPTCHA not loaded');
        }

        return new Promise((resolve) => {
            grecaptcha.enterprise.ready(async () => {
                const token = await grecaptcha.enterprise.execute(GCLOUD_RECAPTCHA_SITE_KEY, {
                    action,
                });
                resolve(token);
            });
        });
    }

    private async onLoad() {
        await this.waitForBadge();

        // Hide badge with css
        const badges = document.getElementsByClassName('grecaptcha-badge');
        if (!badges || !badges.length) throw new Error('Could not find reCAPTCHA badge element');
        badges[0].setAttribute('style', 'visibility: hidden !important;');

        // Set loaded flag
        this.isLoaded = true;
        console.log('Loaded reCAPTCHA script');
    }
}

export default RecaptchaManager;
