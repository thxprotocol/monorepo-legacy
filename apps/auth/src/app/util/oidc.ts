import { Provider } from 'oidc-provider';
import configuration from '../config/oidc';
import { AUTH_URL, DASHBOARD_URL, NODE_ENV } from '../config/secrets';
import { logger } from './logger';

const oidc = new Provider(AUTH_URL, configuration);

oidc.proxy = true;

if (NODE_ENV !== 'production') {
    const { invalidate: orig } = (oidc.Client as any).Schema.prototype;
    (oidc.Client as any).Schema.prototype.invalidate = function invalidate(message, code) {
        if (code === 'implicit-force-https' || code === 'implicit-forbid-localhost') return;
        orig.call(this, message);
    };
}

function isBase64(str: string) {
    return str.startsWith('ey');
}

// In order to provide a return_url to stateless browsers (eg Twitter webview after authentication)
// we override the interaction state to contain both the state localstorage ID and returnUrl
// Important to return after first save of base64 string as the hook will loop if not
oidc.on('interaction.saved', async (interaction) => {
    try {
        const { state, return_url, pool_id } = interaction.params;
        // Check if state is base64 or no pool ID and return early
        if (isBase64(state as string) || !pool_id) return;

        const returnUrl = new URL(return_url as string);
        returnUrl.pathname = `/c/${pool_id}/signin`;

        const stateSerialized = JSON.stringify({ stateId: state, returnUrl });
        interaction.params.state = Buffer.from(stateSerialized).toString('base64');

        await interaction.save(Date.now() + 3600000);
    } catch (error) {
        logger.error(error);
    }
});

export { oidc };
