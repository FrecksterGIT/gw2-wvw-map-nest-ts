export default interface ICache {
  set(key: string, value: any, cacheTime: number): Promise<void>;

  get(key: string): Promise<any>;

  remove(key: string): void;

  info(): any;
}
