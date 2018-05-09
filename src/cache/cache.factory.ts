import {CacheType} from './enums/cache-type.enum';
import InMemoryCache from './impl/in-memory-cache.class';
import NoCache from './impl/no-cache.class';
import ICacheHolder from './interfaces/cache-holder.interface';

export default class CacheFactory {

  private static cachesHolders: ICacheHolder[] = [];

  public static getCache(cacheType: CacheType): ICacheHolder {
    let cache: ICacheHolder = this.cachesHolders.find((c: ICacheHolder) => c.type === cacheType);
    if (!cache) {
      cache = this.createCache(cacheType);
      this.cachesHolders.push(cache);
    }
    return cache;
  }

  private static createCache(type: CacheType): ICacheHolder {
    switch (type) {
      case CacheType.NoCache:
        return {
          cache: new NoCache(),
          type
        };
      case CacheType.InMemory:
        return {
          cache: new InMemoryCache(),
          type
        };
    }
  }

}
