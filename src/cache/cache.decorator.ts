import {CacheFactory} from './cache.factory';
import {CacheType} from './enums/cache-type.enum';

function getCacheKey(propertyKey, args): string {
  return propertyKey + JSON.stringify((args));
}

export function Cache(cacheTime: number, cacheType: CacheType = CacheType.InMemory): MethodDecorator {
  return (target, propertyKey: string, descriptor: PropertyDescriptor) => {

    const method = (typeof descriptor.get !== 'function') ? descriptor.value : descriptor.get.call(this);

    if (typeof method !== 'function') {
      throw new Error('@Cache decorator can only be applied to methods.');
    }

    descriptor.value = (...args: any[]) => {
      const cacheHolder = CacheFactory.getCache(cacheType);
      const cacheKey = getCacheKey(propertyKey, args);
      const result = cacheHolder.cache.get(cacheKey);
      if (result !== undefined) {
        return Promise.resolve(result);
      }
      return method.apply(target, args).then((r) => {
        if (r) {
          cacheHolder.cache.set(cacheKey, r, cacheTime);
        }
        return r;
      });
    };

  };
}
