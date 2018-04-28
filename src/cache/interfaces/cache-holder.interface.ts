import {CacheTypes} from '../enums/cache-types.enum';
import ICache from './cache.interface';

export interface ICacheHolder {
  cache: ICache;
  type: CacheTypes;
}
