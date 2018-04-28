import {IColorsWithStringsArray, IMatch} from './match.interface';

export interface IMatchDisplay extends IMatch {
  world_names?: IColorsWithStringsArray;
}
