import THXClient from '../client/Client';
import BaseManager from './BaseManager';

export default class StoreManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    getValue(key: string) {
        return window.sessionStorage.getItem(key);
    }

    storeValue(key: string, value: string) {
        window.sessionStorage.setItem(key, value);
    }

    storeValueFromURL(key: string) {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        if (params[key]) {
            window.sessionStorage.setItem(key, params[key]);
        }
    }
}
