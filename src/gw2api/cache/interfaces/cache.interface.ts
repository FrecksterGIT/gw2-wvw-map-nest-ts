export default interface ICache {
  writeToCache(key: string, value: any, cacheTime: number);

  readFromCache(key: string);
}
