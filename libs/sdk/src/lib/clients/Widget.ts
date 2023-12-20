import { THXWidgetOptions } from '../types';

export default class THXWidget {
    static create(options: THXWidgetOptions) {
        if (document.getElementById('thx-container')) return;
        if (!options) throw new Error("Please provide 'options'.");

        const { campaignId, apiUrl, identity } = options;
        if (!campaignId) throw new Error("Please provide 'options.campaignId'.");

        const url = new URL(apiUrl || 'https://api.thx.network');
        url.pathname = `/v1/widget/${campaignId}.js`;

        if (identity) {
            url.searchParams.append('identity', identity);
        }

        const script = document.createElement('script');
        script.src = url.href;

        document.body.appendChild(script);
    }
}
