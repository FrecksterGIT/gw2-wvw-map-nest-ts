import {Controller, Get, Param, Render} from '@nestjs/common';
import {IMatchDisplay} from '../gw2api/interfaces/match-display.interface';
import {WorldMapService} from './world-map.service';

@Controller()
export class WorldMapController {

  constructor(private readonly mapService: WorldMapService) {
  }

  @Get()
  @Render('world-map')
  public async root(@Param('lang') lang: string = 'en') {
    const matches: IMatchDisplay[] = await this.mapService.getMatchesData(lang);
    const objectives = await this.mapService.getObjectives(lang);
    return {
      locale: lang,
      map: objectives,
      matches,
      title: 'GW2 - WvW Map'
    };
  }

  @Get('de')
  @Render('world-map')
  public async de() {
    return this.root('de');
  }

  @Get('es')
  @Render('world-map')
  public async es() {
    return this.root('es');
  }

  @Get('fr')
  @Render('world-map')
  public async fr() {
    return this.root('fr');
  }
}
