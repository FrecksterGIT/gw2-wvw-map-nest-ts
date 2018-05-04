import addSeconds = require('date-fns/add_seconds');
import isFuture = require('date-fns/is_future');
import ICache from '../interfaces/cache.interface';
import IStorageItem from '../interfaces/storage-item.interface';

export default class InMemoryCache implements ICache {
  private storage: IStorageItem[] = [];

  public readFromCache(cacheKey: string): any {
    const storedItem = this.storage.find((item) => item.key === cacheKey && isFuture(item.validUntil));
    if (storedItem) {
      return JSON.parse(storedItem.value);
    }
    this.deleteCacheKey(cacheKey);
    return undefined;
  }

  public writeToCache(cacheKey: string, cacheValue: any, cacheTime: number) {
    this.deleteCacheKey(cacheKey);
    if (!!cacheValue) {
      const validUntil = addSeconds(new Date(), cacheTime);
      this.storage.push({
        key: cacheKey,
        validUntil,
        value: JSON.stringify(cacheValue)
      });
    }

  }

  private deleteCacheKey(cacheKey: string) {
    this.storage = this.storage.filter((item) => item.key !== cacheKey && isFuture(item.validUntil));
  }
}
