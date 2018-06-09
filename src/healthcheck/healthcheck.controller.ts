import {Controller, Get, Req, Res} from '@nestjs/common';
import * as healthcheck from 'healthcheck-middleware';
import {UpdateGateway} from '../update/update.gateway';
import {HealthcheckService} from './healthcheck.service';

@Controller()
export class HealthcheckController {

  constructor(
    private readonly healthcheckService: HealthcheckService,
    private readonly updateGateway: UpdateGateway) {
  }

  @Get('/check')
  public async root(@Req() req, @Res() res): Promise<void> {
    const subscriptions = this.updateGateway.getAllSubsciptions();
    const apiStatus = await this.healthcheckService.getApiStatus();
    const cacheInfo = await this.healthcheckService.getCacheInfo();
    return healthcheck({
      healthInfo: (passInfo) => {
        passInfo.apiStatus = apiStatus;
        passInfo.cacheInfos = cacheInfo;
        passInfo.subscriptions = subscriptions;
        return passInfo;
      }
    })(req, res);
  }
}
