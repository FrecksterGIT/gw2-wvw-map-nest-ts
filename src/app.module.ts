import {Module} from '@nestjs/common';
import {Gw2ApiModule} from './gw2api/gw2-api.module';
import {WorldMapModule} from './worldmap/world-map.module';

@Module({
  exports: [Gw2ApiModule],
  imports: [Gw2ApiModule, WorldMapModule]
})
export class ApplicationModule {
}
