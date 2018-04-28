import ICache from '../interfaces/cache.interface';

export default class NoCache implements ICache {

  public readFromCache(key: string): any {
    return false;
  }

  public writeToCache(key: string, value: any, cacheTime: number) {
    // noop
  }
}
