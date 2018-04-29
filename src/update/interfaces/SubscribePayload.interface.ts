import {IColorsWithStrings, IColorsWithStringsArray} from '../../gw2api/interfaces/match.interface';
import {IScorePayload} from './ScorePayload.interface';

export interface ISubscribePayload extends IScorePayload {
  main_worlds: IColorsWithStrings;
  link_worlds: IColorsWithStringsArray;
}
