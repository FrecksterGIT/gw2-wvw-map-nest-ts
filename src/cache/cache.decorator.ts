import crypto = require('crypto');
import CacheFactory from './cache.factory';
import {CacheType} from './enums/cache-type.enum';

function getCacheKey(propertyKey, args): string {
  const key = propertyKey + JSON.stringify((args));
  return crypto.createHash('md5').update(key).digest('hex');
}

interface ICacheDecoratorParams {
  cacheTime?: number;
  cacheType?: CacheType;
}

const serialize = (value) => {
  if (value instanceof Buffer) {
    return value;
  }
  return JSON.stringify(value);
};

const unserialize = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    if (value !== null) {
      return Buffer.from(value);
    }
    return null;
  }
};

export default function Cache(
  {cacheTime, cacheType = CacheType.InMemory}: ICacheDecoratorParams): MethodDecorator {
  return (target, propertyKey: string, descriptor: PropertyDescriptor) => {

    const method = (typeof descriptor.get !== 'function') ? descriptor.value : descriptor.get.call(this);

    if (typeof method !== 'function') {
      throw new Error('@Cache decorator can only be applied to methods.');
    }

    descriptor.value = async function(...args: any[]) {
      const cacheKey = getCacheKey(propertyKey, args);
      const cacheHolder = CacheFactory.getCache(cacheType);
      const result = await cacheHolder.cache.get(cacheKey);
      if (result !== null) {
        const returnValue = unserialize(result);
        return Promise.resolve(returnValue);
      }
      const r = await method.apply(this, args);
      if (r) {
        await cacheHolder.cache.set(cacheKey, serialize(r), cacheTime);
      }
      return r;
    };

  };
}
