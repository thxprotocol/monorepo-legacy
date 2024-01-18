import { Provider } from 'oidc-provider';
import configuration from '../config/oidc';
import { AUTH_URL, NODE_ENV } from '../config/secrets';

const oidc = new Provider(AUTH_URL, configuration);

oidc.proxy = true;

if (NODE_ENV !== 'production') {
    const { invalidate: orig } = (oidc.Client as any).Schema.prototype;
    (oidc.Client as any).Schema.prototype.invalidate = function invalidate(message, code) {
        if (code === 'implicit-force-https' || code === 'implicit-forbid-localhost') return;
        orig.call(this, message);
    };
}

export { oidc };
