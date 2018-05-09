import addSeconds = require('date-fns/add_seconds');
import isFuture = require('date-fns/is_future');
import ICache from '../interfaces/cache.interface';
import IStorageItem from '../interfaces/storage-item.interface';

export default class InMemoryCache implements ICache {
  private storage: IStorageItem[] = [];

  public get(key: string): any {
    const storedItem = this.storage.find((item) => item.key === key && isFuture(item.validUntil));
    if (storedItem) {
      return JSON.parse(storedItem.value);
    }
    this.remove(key);
    return undefined;
  }

  public set(key: string, cacheValue: any, cacheTime: number) {
    this.remove(key);
    if (!!cacheValue) {
      const validUntil = addSeconds(new Date(), cacheTime);
      this.storage.push({
        key,
        validUntil,
        value: JSON.stringify(cacheValue)
      });
    }

  }

  public remove(key: string) {
    this.storage = this.storage.filter((item) => item.key !== key && isFuture(item.validUntil));
  }
}
