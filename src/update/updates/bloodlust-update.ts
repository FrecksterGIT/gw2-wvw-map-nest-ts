import IBloodlustData from '../interfaces/bloodlust-payload.interface';
import {IUpdateData} from '../interfaces/update-data.interface';

export class BloodlustUpdate implements IUpdateData {

  public readonly type: string = BloodlustUpdate.name;

  constructor(public readonly id: string, public readonly payload: IBloodlustData[]) {
  }
}
