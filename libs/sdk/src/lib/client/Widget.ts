import { URL_CONFIG } from '../configs';

interface THXWidgetOptions {
    env: 'local' | 'dev' | 'prod';
    poolId: string;
}

export default class THXWidget {
    constructor(options: THXWidgetOptions) {
        const env = options.env || 'prod';
        const { API_URL } = URL_CONFIG[env];
        const script = document.createElement('script');
        const url = new URL(API_URL);
        url.pathname = `v1/widget/${options.poolId}.js`;
        script.src = url.href;
        document.body.appendChild(script);
    }
}
