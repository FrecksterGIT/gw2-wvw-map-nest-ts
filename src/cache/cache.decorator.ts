import {Logger} from '@nestjs/common';
import {CacheTypes} from './enums/cache-types.enum';
import InMemoryCache from './impl/in-memory-cache.class';
import NoCache from './impl/no-cache.class';
import {ICacheHolder} from './interfaces/cache-holder.interface';

const cachesHolder = [];

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

export function Cache(cacheTime: number, cacheType: CacheTypes = CacheTypes.InMemory): MethodDecorator {
  return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    let cacheHolder: ICacheHolder = cachesHolder.find((c: ICacheHolder) => c.type === cacheType);
    if (!cacheHolder) {
      cacheHolder = createStorage(cacheType);
      cachesHolder.push(cacheHolder);
    }
    descriptor.value = async function(...args: any[]) {
      const cacheKey = propertyKey + JSON.stringify(args);
      let result = cacheHolder.cache.readFromCache(cacheKey);
      if (!result) {
        Logger.log('miss: ' + cacheKey, 'Cache');
        result = await method.apply(this, args);
        cacheHolder.cache.writeToCache(cacheKey, result, cacheTime);
      }
      else {
        // Logger.log('hit', 'Cache');
      }
      return result;
    };
  };
}
