import {Gw2ApiService} from '../../gw2api/gw2-api.service';
import {IMatchDisplay} from '../../gw2api/interfaces/match-display.interface';
import {ISubscribePayload} from '../interfaces/subscribe-payload.interface';
import {IUpdateData} from '../interfaces/update-data.interface';

export class SubscribeUpdate implements IUpdateData {

  public readonly type: string = SubscribeUpdate.name;
  public id: string;
  public payload: ISubscribePayload;

  constructor(match: IMatchDisplay) {
    this.id = match.id;
    const currentScores = Gw2ApiService.getCurrentSkirmish(match.skirmishes).scores;
    this.payload = {
      deaths: match.deaths,
      income: match.scores,
      kills: match.kills,
      link_worlds: match.link_worlds,
      main_worlds: match.main_worlds,
      scores: currentScores,
      skirmishes: match.skirmishes,
      victoryPoints: match.victory_points
    };
  }
}
