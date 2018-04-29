import {IColorsWithNumbers, IMatchObjective} from '../../gw2api/interfaces/match.interface';

type UpdatePayload = IColorsWithNumbers | IMatchObjective[];

export interface IUpdateData {
  id: string;
  payload: UpdatePayload;
  type: string;
}
