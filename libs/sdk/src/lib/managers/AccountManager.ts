import { URL_CONFIG } from '../configs';
import { THXClient } from '../../index';

import BaseManager from './BaseManager';

export default class AccountManager extends BaseManager {
  constructor(client: THXClient) {
    super(client);
  }

  async get() {
    try {
      const res = await this.client.request.get(`${URL_CONFIG['API_URL']}/v1/account`);
      return await res.json();
    } catch (e) {
      console.log(e);
      return {};
    }
  }
}
