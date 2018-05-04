import {IObjectivesPayload} from '../interfaces/objectives-payload.interface';
import {IUpdateData} from '../interfaces/update-data.interface';

export class ObjectiveUpdate implements IUpdateData {

  public readonly type: string = ObjectiveUpdate.name;

  constructor(public readonly id: string, public readonly payload: IObjectivesPayload) {
  }
}
