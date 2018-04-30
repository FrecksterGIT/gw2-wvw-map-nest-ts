import ICache from '../interfaces/cache.interface';
import IStorageItem from '../interfaces/storage-item.interface';

import addSeconds = require('date-fns/add_seconds');
import isAfter = require('date-fns/is_after');

export default class InMemoryCache implements ICache {
  private storage: IStorageItem[] = [];

  public readFromCache(cacheKey: string): any {
    const storedItem = this.storage.find((item) => item.key === cacheKey);
    if (storedItem) {
      const now = new Date();
      if (isAfter(storedItem.validUntil, now)) {
        return storedItem.value;
      } else {
        const index = this.storage.findIndex((item) => item.key === cacheKey);
        if (index >= 0) {
          this.storage.splice(index, 1);
        }
      }
    }
    return undefined;
  }

  public writeToCache(cacheKey: string, cacheValue: any, cacheTime: number) {
    const now = new Date();
    const validUntil = addSeconds(now, cacheTime);
    const index = this.storage.findIndex((item) => item.key === cacheKey);
    if (index >= 0) {
      this.storage.splice(index, 1);
    }
    this.storage.splice(index, 1);
    this.storage.push({
      key: cacheKey,
      validUntil,
      value: cacheValue
    });
  }
}
