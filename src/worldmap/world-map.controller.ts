import {Controller, Get, Render} from '@nestjs/common';
import {WorldMapService} from './world-map.service';

@Controller()
export class WorldMapController {

  constructor(private readonly mapService: WorldMapService) {
  }

  @Get()
  @Render('world-map')
  public async root() {
    return {
      title: 'Gw2',
      worlds: await this.mapService.getMapData()
    };
  }
}
