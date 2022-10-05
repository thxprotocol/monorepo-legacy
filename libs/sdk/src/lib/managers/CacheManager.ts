import THXClient from '../client/Client';
import BaseManager from './BaseManager';

class CacheManager<DataType> extends BaseManager {
  _cached: DataType = null!;

  constructor(client: THXClient, data: DataType) {
    super(client);

    this._cached = data;
  }

  get cached() {
    return this._cached;
  }
}

export default CacheManager;
