import {IColorsWithNumbers, IMatchObjective} from '../../gw2api/interfaces/match.interface';
import {UpdateType} from './updates.enum';

type UpdatePayload = IColorsWithNumbers | IMatchObjective[];

export interface IUpdateData {
  id: string;
  payload: UpdatePayload;
  type: UpdateType;
}
