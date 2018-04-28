import {Component} from '@nestjs/common';
import {Gw2ApiService} from '../gw2api/gw2-api.service';
import {IMatchDisplay} from '../gw2api/interfaces/match-display.interface';
import {IMatch} from '../gw2api/interfaces/match.interface';

@Component()
export class WorldMapService {

  constructor(private readonly gw2ApiService: Gw2ApiService) {
  }

  public async getMatchesData(): Promise<IMatchDisplay[]> {
    await this.gw2ApiService.getWorlds();
    const matchData = await this.gw2ApiService.getMatches();
    return await Promise.all(
      matchData.map(async (match): Promise<IMatchDisplay> => await this.fillMatch(match))
    );
  }

  private async fillMatch(match: IMatch): Promise<IMatchDisplay> {
    return this.gw2ApiService.getMatchDisplay(match);
  }
}
