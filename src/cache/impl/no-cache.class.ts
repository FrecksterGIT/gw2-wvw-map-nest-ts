import ICache from '../interfaces/cache.interface';

export default class NoCache implements ICache {

  public async get(key: string): Promise<any> {
    return null;
  }

  public async set(key: string, value: any, cacheTime: number) {
    // noop
  }

  public remove(key: string): void {
    // noop
  }
}
