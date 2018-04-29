import {IColorsWithStrings, IColorsWithStringsArray, IMatch} from './match.interface';

export interface IMatchDisplay extends IMatch {
  world_names?: IColorsWithStringsArray;
  main_worlds?: IColorsWithStrings;
  link_worlds?: IColorsWithStringsArray;
}
