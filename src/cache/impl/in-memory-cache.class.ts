import ICache from '../interfaces/cache.interface';

export default class InMemoryCache implements ICache {
  private storage: Map<string, string> = new Map<string, string>();

  public async get(key: string): Promise<any> {
    const storedItem = this.storage.get(key);
    if (storedItem) {
      return storedItem;
    }
    return null;
  }

  public async set(key: string, cacheValue: any, cacheTime: number) {
    if (!!cacheValue) {
      this.storage.set(key, cacheValue);
      setTimeout(() => {
        this.remove(key);
      }, cacheTime * 60);
    }
  }

  public remove(key: string) {
    this.storage.delete(key);
  }

  public info() {
    return {size: this.storage.size};
  }
}
