import InMemoryCache from '../cache/in-memory-cache.class';

const memoryCache = new InMemoryCache();

export function Cache(cacheTime: number): MethodDecorator {
  return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = propertyKey + JSON.stringify(args);
      let result = memoryCache.readFromCache(cacheKey);
      if (!result) {
        result = await method.apply(this, args);
        memoryCache.writeToCache(cacheKey, result, cacheTime);
      }
      return result;
    };
  };
}
