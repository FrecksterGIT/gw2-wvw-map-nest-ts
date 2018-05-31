import {IColorsWithStrings, IColorsWithStringsArray, ISkirmish} from '../../gw2api/interfaces/match.interface';
import {IScorePayload} from './score-payload.interface';

export interface ISubscribePayload extends IScorePayload {
  main_worlds: IColorsWithStrings;
  link_worlds: IColorsWithStringsArray;
  skirmishes: ISkirmish[];
}
