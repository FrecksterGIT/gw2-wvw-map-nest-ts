import {Controller, Get, Req, Res} from '@nestjs/common';
import {differenceInSeconds} from 'date-fns';
import * as healthcheck from 'healthcheck-middleware';
import CacheFactory from '../cache/cache.factory';
import {CacheType} from '../cache/enums/cache-type.enum';
import {Gw2ApiService} from '../gw2api/gw2-api.service';
import {IMap, IMatch} from '../gw2api/interfaces/match.interface';
import {UpdateGateway} from '../update/update.gateway';

@Controller()
export class HealthcheckController {

  constructor(private readonly updateGateway: UpdateGateway, private readonly apiService: Gw2ApiService) {
  }

  @Get('/check')
  public async root(@Req() req, @Res() res): Promise<void> {
    const subscriptions = this.updateGateway.getAllSubsciptions();

    const [lastApiUpdate, apiStatus] = await this.getApiHealth();
    const cachesInfos = await Promise.all(
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
    healthcheck({
      healthInfo: (passInfo) => {
        passInfo.apiStatus = apiStatus;
        passInfo.apiUpdate = lastApiUpdate;
        passInfo.cacheInfos = cachesInfos;
        passInfo.subscriptions = subscriptions;
        return passInfo;
      }
    })(req, res);
  }

  private async getApiHealth(): Promise<any> {
    const lastApiUpdate = await this.getLastApiUpdate();
    const apiStatus = (lastApiUpdate && differenceInSeconds(new Date(), lastApiUpdate) <= 600) ? 'healthy' : 'hanging';
    return [lastApiUpdate, apiStatus];
  }

  private async getLastApiUpdate(): Promise<Date> {
    const sampleMatch: IMatch = await this.apiService.getMatch('2-1', 'en');
    return sampleMatch.maps.reduce((latest: Date, map: IMap): Date => {
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
