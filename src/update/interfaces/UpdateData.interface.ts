import {IObjectivesPayload} from './ObjectivesPayload.interface';
import {IUpdatePayload} from './UpdatePayload.interface';

type UpdatePayload = IUpdatePayload| IObjectivesPayload;

export interface IUpdateData {
  id: string;
  payload: UpdatePayload;
  type: string;
}
