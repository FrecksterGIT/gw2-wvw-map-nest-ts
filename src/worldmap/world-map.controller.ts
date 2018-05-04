import {Controller, Get, Logger, Param, Render} from '@nestjs/common';
import {IMatchDisplay} from '../gw2api/interfaces/match-display.interface';
import {WorldMapService} from './world-map.service';

@Controller()
export class WorldMapController {

  constructor(private readonly mapService: WorldMapService) {
  }

  @Get(':lang?')
  @Render('world-map')
  public async root(@Param('lang') lang: string = 'en') {
    Logger.log(lang, 'Controller');
    const matches: IMatchDisplay[] = await this.mapService.getMatchesData(lang);
    const objectives = await this.mapService.getObjectives(lang);
    return {
      map: objectives,
      matches,
      title: 'Gw2'
    };
  }
}
