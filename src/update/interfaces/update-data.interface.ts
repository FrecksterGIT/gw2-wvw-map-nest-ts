import {IObjectivesPayload} from './objectives-payload.interface';
import {IUpdatePayload} from './update-payload.interface';

type UpdatePayload = IUpdatePayload| IObjectivesPayload;

export interface IUpdateData {
  id: string;
  payload: UpdatePayload;
  type: string;
}
