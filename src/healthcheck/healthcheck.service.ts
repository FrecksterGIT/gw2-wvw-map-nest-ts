import {Injectable} from '@nestjs/common';
import {differenceInSeconds} from 'date-fns';
import CacheFactory from '../cache/cache.factory';
import {CacheType} from '../cache/enums/cache-type.enum';
import {Gw2ApiService} from '../gw2api/gw2-api.service';
import {IMap, IMatch} from '../gw2api/interfaces/match.interface';

@Injectable()
export class HealthcheckService {

  public constructor(private readonly apiService: Gw2ApiService) {}

  public async getCacheInfo(): Promise<any> {
    return await Promise.all(
      [CacheType.NoCache,
        CacheType.FileCache,
        CacheType.InMemory,
        CacheType.S3Cache].map(async (cacheType) => {
        const cache = CacheFactory.getCache(cacheType);
        const cacheInfo = await cache.cache.info();
        return {
          info: cacheInfo,
          type: CacheType[cacheType]
        };
      }));
  }

  public async getApiStatus(): Promise<any> {
    const matches: IMatch[] = await this.apiService.getMatches('en');
    return matches.map((match) => {
      const [apiUpdate, apiStatus] = this.getApiHealth(match);
      return {
        apiStatus,
        apiUpdate,
        id: match.id
      };
    });
  }

  private getApiHealth(match: IMatch): [Date, string] {
    const apiUpdate = this.getLastApiUpdate(match);
    const apiStatus = (apiUpdate && differenceInSeconds(new Date(), apiUpdate) <= 600) ? 'healthy' : 'hanging';
    return [apiUpdate, apiStatus];
  }

  private getLastApiUpdate(match: IMatch): Date {
    return match.maps.reduce((latest: Date, map: IMap): Date => {
      return map.objectives.reduce((time, objective): Date => {
        const objDate = new Date(objective.last_flipped);
        if (!latest || (latest < objDate)) {
          return objDate;
        }
        return latest;
      }, latest);
    }, null);
  }
}
