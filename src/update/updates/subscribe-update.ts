import {IMatchDisplay} from '../../gw2api/interfaces/match-display.interface';
import {ISubscribePayload} from '../interfaces/SubscribePayload.interface';
import {IUpdateData} from '../interfaces/UpdateData.interface';

export class SubscribeUpdate implements IUpdateData {

  public readonly type: string = SubscribeUpdate.name;
  public id: string;
  public payload: ISubscribePayload;

  constructor(match: IMatchDisplay) {
    this.id = match.id;
    this.payload = {
      income: match.scores,
      link_worlds: match.link_worlds,
      main_worlds: match.main_worlds,
      scores: match.skirmishes.pop().scores,
      victoryPoints: match.victory_points
    };
  }
}
