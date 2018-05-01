import {Injectable} from '@nestjs/common';
import {Gw2ApiService} from '../gw2api/gw2-api.service';
import {IMatchDisplay} from '../gw2api/interfaces/match-display.interface';
import {IMatch} from '../gw2api/interfaces/match.interface';
import {IObjectiveDisplay} from '../gw2api/interfaces/objective-display.interface';
import {IObjective} from '../gw2api/interfaces/objective.interface';

@Injectable()
export class WorldMapService {

  constructor(private readonly gw2ApiService: Gw2ApiService) {
  }

  public async getObjectives(): Promise<any> {
    const objectives = await this.gw2ApiService.getObjectives();
    const filledObjectives: IObjectiveDisplay[] = await this.fillObjectives(objectives);
    return this.sortObjectives(filledObjectives);
  }

  public async getMatchesData(): Promise<IMatchDisplay[]> {
    await this.gw2ApiService.getWorlds();
    const matchData = await this.gw2ApiService.getMatches();
    return await Promise.all(
      matchData.map(async (match): Promise<IMatchDisplay> => await this.fillMatch(match))
    );
  }

  private sortObjectives(objectives: IObjectiveDisplay[]): any {
    const ordered = {};
    objectives.forEach((objective) => {
      ordered[objective.map_id] = ordered[objective.map_id] || [];
      ordered[objective.map_id].push(objective);
    });
    return ordered;
  }

  private async fillObjectives(objectives: IObjective[]): Promise<IObjectiveDisplay[]> {
    return await this.gw2ApiService.getObjectivesDisplay(objectives);
  }

  private async fillMatch(match: IMatch): Promise<IMatchDisplay> {
    return this.gw2ApiService.getMatchDisplay(match);
  }
}
