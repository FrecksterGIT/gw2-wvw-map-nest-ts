import {CacheTypes} from './enums/cache-types.enum';
import InMemoryCache from './impl/in-memory-cache.class';
import NoCache from './impl/no-cache.class';
import {ICacheHolder} from './interfaces/cache-holder.interface';

const cachesHolders: ICacheHolder[] = [];

function createStorage(type: CacheTypes): ICacheHolder {
  switch (type) {
    case CacheTypes.NoCache:
      return {
        cache: new NoCache(),
        type
      };
    case CacheTypes.InMemory:
      return {
        cache: new InMemoryCache(),
        type
      };
  }
}

function getStorage(cacheType: CacheTypes): ICacheHolder {
  let cache: ICacheHolder = cachesHolders.find((c: ICacheHolder) => c.type === cacheType);
  if (!cache) {
    cache = createStorage(cacheType);
    cachesHolders.push(cache);
  }
  return cache;
}

function getCacheKey(propertyKey, args): string {
  return propertyKey + JSON.stringify((args));
}

export function Cache(cacheTime: number, cacheType: CacheTypes = CacheTypes.InMemory): MethodDecorator {
  return (target, propertyKey: string, descriptor: PropertyDescriptor) => {

    const method = (typeof descriptor.get !== 'function') ? descriptor.value : descriptor.get.call(this);

    if (typeof method !== 'function') {
      throw new Error('@Cache decorator can only be applied to methods.');
    }

    descriptor.value = (...args: any[]) => {
      const cacheHolder = getStorage(cacheType);
      const cacheKey = getCacheKey(propertyKey, args);
      const result = cacheHolder.cache.readFromCache(cacheKey);
      if (result !== undefined) {
        return Promise.resolve(result);
      }
      return method.apply(null, args).then((r) => {
        if (r) {
          cacheHolder.cache.writeToCache(cacheKey, r, cacheTime);
        }
        return r;
      });
    };

  };
}
