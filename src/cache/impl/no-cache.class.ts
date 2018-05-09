import ICache from '../interfaces/cache.interface';

export default class NoCache implements ICache {

  public get(key: string): any {
    return null;
  }

  public set(key: string, value: any, cacheTime: number) {
    // noop
  }

  public remove(key: string): void {
    // noop
  }
}
