import {IColorsWithNumbers, IMatchObjective} from '../../gw2api/interfaces/match.interface';
import {UpdateType} from './updates.enum';

export interface IUpdateData {
  id: string;
  payload: IColorsWithNumbers | IMatchObjective[];
  type: UpdateType;
}
