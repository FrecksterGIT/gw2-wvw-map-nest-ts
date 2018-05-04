import {IScorePayload} from '../interfaces/score-payload.interface';
import {IUpdateData} from '../interfaces/update-data.interface';

export class ScoreUpdate implements IUpdateData {

  public readonly type: string = ScoreUpdate.name;

  constructor(public readonly id: string, public readonly payload: IScorePayload) {
  }
}
