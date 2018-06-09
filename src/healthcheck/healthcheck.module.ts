import {Module} from '@nestjs/common';
import {Gw2ApiModule} from '../gw2api/gw2-api.module';
import {UpdateModule} from '../update/update.module';
import {HealthcheckController} from './healthcheck.controller';

@Module({
  controllers: [HealthcheckController],
  imports: [UpdateModule, Gw2ApiModule]
})
export class HealthcheckModule {
}
