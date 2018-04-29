import {Controller, Get, Render} from '@nestjs/common';
import {IMatchDisplay} from '../gw2api/interfaces/match-display.interface';
import {WorldMapService} from './world-map.service';

@Controller()
export class WorldMapController {

  constructor(private readonly mapService: WorldMapService) {
  }

  @Get()
  @Render('world-map')
  public async root() {
    const matches: IMatchDisplay[] = await this.mapService.getMatchesData();
    const objectives = await this.mapService.getObjectives();
    return {
      map: objectives,
      matches,
      title: 'Gw2'
    };
  }
}
