import THXClient from '../client/Client';

export default class BaseManager {
  client: THXClient = null!;

  constructor(client: THXClient) {
    /**
     * The client that instantiated this Manager
     * @name BaseManager#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });
  }
}
