import {Injectable} from '@nestjs/common';
import {Gw2ApiService} from '../gw2api/gw2-api.service';
import {IMatchDisplay} from '../gw2api/interfaces/match-display.interface';
import {IObjectiveDisplay} from '../gw2api/interfaces/objective-display.interface';

@Injectable()
export class WorldMapService {

  constructor(private readonly gw2ApiService: Gw2ApiService) {
  }

  public async getObjectives(lang: string): Promise<any> {
    const objectives = await this.gw2ApiService.getObjectivesDisplay(lang);
    return this.sortObjectives(objectives);
  }

  public async getMatchesData(lang: string): Promise<IMatchDisplay[]> {
    const matchData = await this.gw2ApiService.getMatches(lang);
    return await Promise.all(
      matchData.map((match): Promise<IMatchDisplay> => this.gw2ApiService.getMatchDisplay(match, lang))
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

}
