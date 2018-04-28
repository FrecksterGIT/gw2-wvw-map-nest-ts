import {MapColors} from './match.interface';
import {IObjective} from './objective.interface';

export interface IObjectiveDisplay extends IObjective {
  map?: MapColors;
}
