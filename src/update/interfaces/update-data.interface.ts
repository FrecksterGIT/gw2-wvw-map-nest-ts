import IBloodlustData from './bloodlust-payload.interface';
import {IObjectivesPayload} from './objectives-payload.interface';
import {IUpdatePayload} from './update-payload.interface';

type UpdatePayload = IUpdatePayload | IObjectivesPayload | IBloodlustData[];

export interface IUpdateData {
  id: string;
  payload: UpdatePayload;
  type: string;
}
