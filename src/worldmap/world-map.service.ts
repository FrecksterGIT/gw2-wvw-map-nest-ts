import {Component} from '@nestjs/common';
import {Gw2ApiService} from '../gw2api/gw2-api.service';
import {IMatchDisplay} from '../gw2api/interfaces/match-display.interface';
import {IMatch} from '../gw2api/interfaces/match.interface';
import {IObjectiveDisplay} from '../gw2api/interfaces/objective-display.interface';
import {IObjective} from '../gw2api/interfaces/objective.interface';

@Component()
export class WorldMapService {

  constructor(private readonly gw2ApiService: Gw2ApiService) {
  }

  public async getObjectives(): Promise<IObjectiveDisplay[]> {
    const objectives = await this.gw2ApiService.getObjectives();
    return await this.fillObjectives(objectives);
  }

  public async getMatchesData(): Promise<IMatchDisplay[]> {
    await this.gw2ApiService.getWorlds();
    const matchData = await this.gw2ApiService.getAllMatches();
    return await Promise.all(
      matchData.map(async (match): Promise<IMatchDisplay> => await this.fillMatch(match))
    );
  }

  private async fillObjectives(objectives: IObjective[]): Promise<IObjectiveDisplay[]> {
    return await this.gw2ApiService.getObjectivesDisplay(objectives);
  }

  private async fillMatch(match: IMatch): Promise<IMatchDisplay> {
    return this.gw2ApiService.getMatchDisplay(match);
  }
}
