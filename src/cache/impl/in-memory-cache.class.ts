import ICache from '../interfaces/cache.interface';
import IStorageItem from '../interfaces/storage-item.interface';

export default class InMemoryCache implements ICache {
  private storage: IStorageItem[] = [];

  public readFromCache(key: string): any {
    const storedItem = this.storage.find((item) => item.key === key);
    if (storedItem) {
      const now: number = (new Date()).getTime();
      const validUntil: number = (new Date(storedItem.validUntil)).getTime();
      if (validUntil >= now) {
        return storedItem.value;
      }
    }
    return false;
  }

  public writeToCache(key: string, value: any, cacheTime: number) {
    const validUntil = new Date();
    validUntil.setSeconds(validUntil.getSeconds() + cacheTime);
    this.storage.push({
      key,
      validUntil: validUntil.getTime(),
      value
    });
  }
}
