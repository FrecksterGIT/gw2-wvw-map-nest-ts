import {Logger} from '@nestjs/common';
import ICache from '../interfaces/cache.interface';
import IStorageItem from '../interfaces/storage-item.interface';

import addSeconds = require('date-fns/add_seconds');
import isFuture = require('date-fns/is_future');

export default class InMemoryCache implements ICache {
  private storage: IStorageItem[] = [];

  public readFromCache(cacheKey: string): any {
    Logger.log('items: ' + String(this.storage.length), 'Cache');
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
