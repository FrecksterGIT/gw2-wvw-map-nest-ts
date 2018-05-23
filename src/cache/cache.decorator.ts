import {Logger} from '@nestjs/common';
import crypto = require('crypto');
import * as fs from 'fs';
import {promisify} from 'util';
import CacheFactory from './cache.factory';
import {CacheType} from './enums/cache-type.enum';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);

function getCacheKey(propertyKey, args): string {
  const key = propertyKey + JSON.stringify((args));
  return crypto.createHash('md5').update(key).digest('hex');
}

interface ICacheDecoratorParams {
  cacheTime?: number;
  cacheType?: CacheType;
  isStatic?: boolean;
}

export default function Cache(
  {cacheTime, cacheType = CacheType.InMemory, isStatic = false}: ICacheDecoratorParams): MethodDecorator {
  return (target, propertyKey: string, descriptor: PropertyDescriptor) => {

    const method = (typeof descriptor.get !== 'function') ? descriptor.value : descriptor.get.call(this);

    if (typeof method !== 'function') {
      throw new Error('@Cache decorator can only be applied to methods.');
    }

    descriptor.value = async function(...args: any[]) {
      const cacheKey = getCacheKey(propertyKey, args);
      const cacheHolder = CacheFactory.getCache(cacheType);
      const result = cacheHolder.cache.get(cacheKey);
      if (result !== null) {
        Logger.log('from memory');
        if (result.type === 'Buffer') {
          const buffer = Buffer.from(result);
          return Promise.resolve(buffer);
        }
        return Promise.resolve(result);
      }
      const dir = './_cache/';
      try {
        const dirStat = await stat(dir);
        if (!dirStat.isDirectory()) {
          await mkdir(dir);
        }
      } catch {
        try {
          await mkdir(dir);
        } catch {
          /* noop */
        }
      }
      const path = dir + cacheKey;
      if (isStatic) {
        // try loading from _cache folder
        if (fs.existsSync(path)) {
          Logger.log('from file');
          const content = await readFile(path, {encoding: 'utf8'});
          const json = JSON.parse(content);
          if (json.type === 'Buffer') {
            const buffer = Buffer.from(json);
            cacheHolder.cache.set(cacheKey, buffer, cacheTime);
            return Promise.resolve(buffer);
          }
          cacheHolder.cache.set(cacheKey, json, cacheTime);
          return Promise.resolve(json);
        }
      }
      Logger.log('from function call...');
      const r = await method.apply(this, args);
      if (r) {
        cacheHolder.cache.set(cacheKey, r, cacheTime);
        if (isStatic) {
          await writeFile(path, JSON.stringify(r), {encoding: 'utf8'});
        }
      }
      return r;
    };

  };
}
