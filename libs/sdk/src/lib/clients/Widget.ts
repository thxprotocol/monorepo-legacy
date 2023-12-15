import { THXWidgetOptions } from '../types';

export default class THXWidget {
    constructor(options: THXWidgetOptions) {
        const baseUrl = options.url || 'https://api.thx.network';
        const url = new URL(baseUrl);
        url.pathname = `/v1/widget/${options.poolId}.js`;

        const script = document.createElement('script');
        script.src = url.href;

        document.body.appendChild(script);
    }
}
