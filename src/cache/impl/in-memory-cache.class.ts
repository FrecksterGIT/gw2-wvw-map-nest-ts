import ICache from '../interfaces/cache.interface';

export default class InMemoryCache implements ICache {
  private storage: Map<string, string> = new Map<string, string>();

  public get(key: string): any {
    const storedItem = this.storage.get(key);
    if (storedItem) {
      return JSON.parse(storedItem);
    }
    return null;
  }

  public set(key: string, cacheValue: any, cacheTime: number) {
    if (!!cacheValue) {
      this.storage.set(key, JSON.stringify(cacheValue));
      setTimeout(() => {
        this.remove(key);
      }, cacheTime * 60);
    }
  }

  public remove(key: string) {
    this.storage.delete(key);
  }
}
