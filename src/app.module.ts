import {Module} from '@nestjs/common';
import {EmblemModule} from './emblem/emblem.module';
import {Gw2ApiModule} from './gw2api/gw2-api.module';
import {HealthcheckModule} from './healthcheck/healthcheck.module';
import {WorldMapModule} from './worldmap/world-map.module';

@Module({
  exports: [Gw2ApiModule, EmblemModule],
  imports: [Gw2ApiModule, WorldMapModule, EmblemModule, HealthcheckModule]
})
export class ApplicationModule {
}
