import {IMatchObjective} from '../../gw2api/interfaces/match.interface';
import {IUpdateData} from '../interfaces/UpdateData.interface';

export class ObjectiveUpdate implements IUpdateData {

  public readonly type: string = ObjectiveUpdate.name;

  constructor(public readonly id: string, public readonly payload: IMatchObjective[]) {
  }
}
