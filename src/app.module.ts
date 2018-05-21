import {Module} from '@nestjs/common';
import {Gw2ApiModule} from './gw2api/gw2-api.module';
import {WorldMapModule} from './worldmap/world-map.module';
import {EmblemModule} from './emblem/emblem.module';

@Module({
  exports: [Gw2ApiModule, EmblemModule],
  imports: [Gw2ApiModule, WorldMapModule, EmblemModule]
})
export class ApplicationModule {
}
