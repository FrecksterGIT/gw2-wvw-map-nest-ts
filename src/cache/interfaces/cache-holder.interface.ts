import {CacheType} from '../enums/cache-type.enum';
import ICache from './cache.interface';

export interface ICacheHolder {
  cache: ICache;
  type: CacheType;
}
