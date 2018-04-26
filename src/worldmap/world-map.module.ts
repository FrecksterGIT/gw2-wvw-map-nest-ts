import {Module} from '@nestjs/common';
import {Gw2ApiModule} from '../gw2api/gw2-api.module';
import {UpdateModule} from '../update/update.module';
import {WorldMapController} from './world-map.controller';
import {WorldMapService} from './world-map.service';

@Module({
  components: [WorldMapService],
  controllers: [WorldMapController],
  imports: [Gw2ApiModule, UpdateModule]
})
export class WorldMapModule {
}
