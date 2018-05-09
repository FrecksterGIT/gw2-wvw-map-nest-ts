import {CacheType} from '../enums/cache-type.enum';
import ICache from './cache.interface';

export default interface ICacheHolder {
  cache: ICache;
  type: CacheType;
}
