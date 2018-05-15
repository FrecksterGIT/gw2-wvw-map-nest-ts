import {IGuild} from './guild.interface';

export enum ObjectiveType {
  Castle = 'Castle',
  Keep = 'Keep',
  Tower = 'Tower',
  Camp = 'Camp',
  Ruins = 'Ruins'
}

export interface IColorsWithNumbers {
  red: number;
  blue: number;
  green: number;
}

export interface IColorsWithStrings {
  red: string;
  blue: string;
  green: string;
}

export interface IColorsWithNumbersArray {
  red: number[];
  blue: number[];
  green: number[];
}

export interface IColorsWithStringsArray {
  red: string[];
  blue: string[];
  green: string[];
}

export interface IMapScore {
  type: string;
  scores: IColorsWithNumbers;
}

export interface ISkirmish {
  id: number;
  scores: IColorsWithNumbers;
  map_scores: IMapScore[];
}

export interface IBonus {
  type: string;
  owner: string;
}

export interface IMatchObjective {
  id: string;
  type: string;
  owner: string;
  last_flipped: Date;
  points_tick: number;
  points_capture: number;
  claimed_by?: string;
  claimed_at?: Date;
  yaks_delivered?: number;
  guild_upgrades: number[];
  guild?: IGuild;
}

export interface IMap {
  id: number;
  type: ObjectiveType;
  scores: IColorsWithNumbers;
  bonuses: IBonus[];
  objectives: IMatchObjective[];
  deaths: IColorsWithNumbers;
  kills: IColorsWithNumbers;
}

export interface IMatch {
  id: string;
  start_time: string; // Date
  end_time: string; // Date
  scores: IColorsWithNumbers;
  worlds: IColorsWithNumbers;
  all_worlds: IColorsWithNumbersArray;
  deaths: IColorsWithNumbers;
  kills: IColorsWithNumbers;
  victory_points: IColorsWithNumbers;
  skirmishes: ISkirmish[];
  maps: IMap[];
}
