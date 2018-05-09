export default interface ICache {
  set(key: string, value: any, cacheTime: number);

  get(key: string): any;

  remove(key: string): void;
}
