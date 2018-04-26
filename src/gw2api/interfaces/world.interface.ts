enum Population {
  Medium = 'Medium',
  VeryHigh = 'VeryHigh',
  Full = 'Full'
}

export interface IWorld {
  id: number;
  name: string;
  population: Population;
}