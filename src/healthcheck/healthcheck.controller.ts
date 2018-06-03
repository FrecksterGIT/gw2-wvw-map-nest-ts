import {Controller, Get, Req, Res} from '@nestjs/common';
import * as healthcheck from 'healthcheck-middleware';
import CacheFactory from '../cache/cache.factory';
import {CacheType} from '../cache/enums/cache-type.enum';
import {UpdateGateway} from '../update/update.gateway';

@Controller()
export class HealthcheckController {

  constructor(private readonly updateGateway: UpdateGateway) {
  }

  @Get('/check')
  public async root(@Req() req, @Res() res): Promise<void> {
    const subscriptions = this.updateGateway.getAllSubsciptions();
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
        passInfo.cacheInfos = cachesInfos;
        passInfo.subscriptions = subscriptions;
        return passInfo;
      }
    })(req, res);
  }
}
