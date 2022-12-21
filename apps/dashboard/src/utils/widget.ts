import { API_URL, WIDGET_ID } from './secrets';

export function initWidget() {
    const script = document.createElement('script');
    script.src = `${API_URL}/v1/widget/${WIDGET_ID}.js`;
    document.body.appendChild(script);
}
