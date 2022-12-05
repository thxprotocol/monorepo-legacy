import THXClient from '../client/Client';
import BaseManager from './BaseManager';

export default class StoreManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    getValue(key: string) {
        return window.sessionStorage.getItem(`thx:sdk:${key}`) as string;
    }

    storeValue(key: string, value: string) {
        window.sessionStorage.setItem(`thx:sdk:${key}`, value);
    }

    storeValueFromURL(key?: string) {
        if (!key) return;

        const params = new URLSearchParams(window.location.search);
        const value = params.get(key);
        if (!value) return;

        window.sessionStorage.setItem(`thx:sdk:${key}`, value as string);
    }
}
