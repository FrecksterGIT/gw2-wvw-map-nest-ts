import {IObjectivesPayload} from '../interfaces/ObjectivesPayload.interface';
import {IUpdateData} from '../interfaces/UpdateData.interface';

export class ObjectiveUpdate implements IUpdateData {

  public readonly type: string = ObjectiveUpdate.name;

  constructor(public readonly id: string, public readonly payload: IObjectivesPayload) {
  }
}
