import {IColorsWithNumbers} from '../../gw2api/interfaces/match.interface';
import {IUpdatePayload} from './update-payload.interface';

export interface IScorePayload extends IUpdatePayload {
  scores: IColorsWithNumbers;
  income: IColorsWithNumbers;
  victoryPoints: IColorsWithNumbers;
}
