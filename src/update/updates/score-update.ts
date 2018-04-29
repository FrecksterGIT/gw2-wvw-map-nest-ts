import {IScorePayload} from '../interfaces/ScorePayload.interface';
import {IUpdateData} from '../interfaces/UpdateData.interface';

export class ScoreUpdate implements IUpdateData {

  public readonly type: string = ScoreUpdate.name;

  constructor(public readonly id: string, public readonly payload: IScorePayload) {
  }
}
